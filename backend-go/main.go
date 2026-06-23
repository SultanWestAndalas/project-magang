package main

import (
	"backend-go/config"
	"backend-go/controllers"
	"backend-go/middlewares"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	config.ConnectDB()

	r := gin.Default()

	// Pasang CORS di sini agar semua API bisa diakses dari frontend
	// Gunakan konfigurasi ini agar browser berhenti memblokir request Next.js
	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true, // Mengizinkan akses dari localhost, IP Wi-Fi, dll
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Welcome to rAi CMS API!"})
	})

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "pong"})
	})

	// === BUKA JALUR FOLDER UPLOADS ===
	// Artinya: Jika ada permintaan ke URL "/uploads/...", arahkan ke folder lokal "./uploads"
	r.Static("/uploads", "./uploads")

	// === ROUTE UNTUK ROLE ===
	api := r.Group("/api")
	{
		api.GET("/roles", controllers.GetRoles)
		api.POST("/roles", controllers.CreateRole)

		// === ROUTE UNTUK USER ===
		api.POST("/register", controllers.RegisterUser)
		api.POST("/login", controllers.LoginUser)

		// === ROUTE PUBLIK (Tanpa Token) ===
		api.GET("/public/posts", controllers.GetPublicPosts)
		api.GET("/public/posts/:slug", controllers.GetPublicPostBySlug)
		api.GET("/public/categories", controllers.GetPublicCategories)
		api.GET("/public/quizzes/:id", controllers.GetQuizByPost)
	}

	// === ROUTE TERPROTEKSI (Wajib Login) ===
	protected := r.Group("/api")
	protected.Use(middlewares.RequireAuth()) // Pasang "satpam login" di sini
	{
		protected.GET("/profile", func(c *gin.Context) {
			userID := c.MustGet("user_id")
			roleID := c.MustGet("role_id")
			c.JSON(http.StatusOK, gin.H{"message": "Area terproteksi", "user_id": userID, "role_id": roleID})
		})

		// === ROUTE UNTUK USERS (Manajemen Akun) ===
		// Hanya bisa diakses oleh Super Admin (role_id: 1)
		protected.GET("/users", middlewares.RequireRole(1), controllers.GetUsers)
		protected.DELETE("/users/:id", middlewares.RequireRole(1), controllers.DeleteUser)

		// Opsional: Kita juga bisa memindahkan rute Register ke dalam sini nanti
		// agar yang bisa bikin akun baru hanya Super Admin, bukan dari halaman publik.

		// === ROUTE UNTUK DASHBOARD STATISTIK ===
		protected.GET("/dashboard/stats", controllers.GetDashboardStats)

		// === ROUTE UNTUK POSTS (ARTIKEL) ===
		protected.GET("/posts", controllers.GetPosts)
		protected.POST("/posts", controllers.CreatePost)
		protected.PUT("/posts/:id", controllers.UpdatePost)
		protected.DELETE("/posts/:id", controllers.DeletePost)
		protected.POST("/posts/:id/complete", controllers.CompletePost)

		// === ROUTE UNTUK CATEGORIES ===
		protected.GET("/categories", controllers.GetCategories)
		protected.POST("/categories", controllers.CreateCategory)

		// Pasang gembok RequireRole(1). Artinya HANYA role_id 1 (Super Admin) yang bisa Edit/Hapus kategori
		protected.PUT("/categories/:id", middlewares.RequireRole(1), controllers.UpdateCategory)
		protected.DELETE("/categories/:id", middlewares.RequireRole(1), controllers.DeleteCategory)
	}

	r.Run(":8080")
}
