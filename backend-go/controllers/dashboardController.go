package controllers

import (
	"backend-go/config"
	"backend-go/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Fungsi untuk mengambil angka statistik Dashboard
func GetDashboardStats(c *gin.Context) {
	// Ambil ID dan Role dari token JWT
	userID, _ := c.Get("user_id")
	roleID, _ := c.Get("role_id")

	var postCount int64
	var categoryCount int64
	var userCount int64

	// 1. Hitung Total Artikel
	postQuery := config.DB.Model(&models.Post{})
	// Jika bukan Superadmin, hitung HANYA artikel miliknya sendiri
	if roleID.(float64) != 1 {
		postQuery = postQuery.Where("author_id = ?", userID)
	}
	postQuery.Count(&postCount)

	// 2. Hitung Total Kategori
	config.DB.Model(&models.Category{}).Count(&categoryCount)

	// 3. Hitung Total Pengguna
	config.DB.Model(&models.User{}).Count(&userCount)

	// Kirimkan hasilnya dalam format JSON
	c.JSON(http.StatusOK, gin.H{
		"message": "Berhasil mengambil statistik dashboard",
		"data": gin.H{
			"total_posts":      postCount,
			"total_categories": categoryCount,
			"total_users":      userCount,
		},
	})
}