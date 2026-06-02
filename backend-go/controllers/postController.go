package controllers

import (
	"backend-go/config"
	"backend-go/models"
	"net/http"
	"path/filepath" 
	"strconv"       
	"strings"      
	"time"         

	"github.com/gin-gonic/gin"
)

// Struct untuk menangkap input dari Postman/Frontend
type PostInput struct {
	Title      string `json:"title" binding:"required"`
	Slug       string `json:"slug" binding:"required"`
	Content    string `json:"content" binding:"required"`
	CategoryID uint   `json:"category_id" binding:"required"`
	Status     string `json:"status"` // "draft" atau "published"
}

// Fungsi untuk melihat semua artikel (Sudah Terproteksi RBAC)
func GetPosts(c *gin.Context) {
	// 1. Ambil data user_id dan role_id dari token JWT (di-set oleh middleware RequireAuth)
	userID, _ := c.Get("user_id")
	roleID, _ := c.Get("role_id")

	var posts []models.Post
	// Buat query dasar dengan Preload Tags
	dbQuery := config.DB.Preload("Tags").Preload("Author") // Tambahkan preload Author

	// 2. Logika RBAC: Jika role_id BUKAN 1 (Bukan Super Admin), saring berdasarkan author_id
	// Ingat: JWT membaca semua angka sebagai float64 di Golang, jadi gunakan .(float64)
	if roleID.(float64) != 1 {
		dbQuery = dbQuery.Where("author_id = ?", userID)
	}

	// 3. Eksekusi Query ke Database
	if err := dbQuery.Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data artikel"})
		return
	}

	// Tetap pertahankan properti message lamamu di sini
	c.JSON(http.StatusOK, gin.H{
		"message": "Berhasil mengambil data artikel",
		"data":    posts,
	})
}

// Fungsi untuk membuat artikel baru
func CreatePost(c *gin.Context) {
	// 1. Ambil data teks dari form (bukan lagi dari JSON)
	title := c.PostForm("title")
	content := c.PostForm("content")
	categoryIDStr := c.PostForm("category_id")
	status := c.PostForm("status")

	// 2. Ambil ID user yang sedang login dari token JWT
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User tidak valid"})
		return
	}

	// Konversi tipe data
	categoryID, _ := strconv.Atoi(categoryIDStr)
	
	// Buat slug otomatis dari judul
	slug := strings.ToLower(strings.ReplaceAll(title, " ", "-")) + "-" + strconv.FormatInt(time.Now().Unix(), 10)

	// 3. LOGIKA PENERIMAAN GAMBAR (THUMBNAIL)
	var thumbnailPath string
	file, err := c.FormFile("thumbnail")
	
	if err == nil { // Jika ada file yang diunggah
		// Buat nama file unik (timestamp + ekstensi asli) untuk mencegah bentrok nama
		extension := filepath.Ext(file.Filename)
		newFileName := strconv.FormatInt(time.Now().Unix(), 10) + extension
		
		// Tentukan rute simpan (di server) dan rute akses (untuk database)
		savePath := "./uploads/" + newFileName
		thumbnailPath = "/uploads/" + newFileName

		// Simpan file fisik ke folder ./uploads
		if err := c.SaveUploadedFile(file, savePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan gambar ke server"})
			return
		}
	}

	// 4. Susun data artikel untuk disimpan ke Database
	post := models.Post{
		Title:      title,
		Slug:       slug,
		Content:    content,
		CategoryID: uint(categoryID),
		AuthorID:   uint(userID.(float64)),
		Status:     status,
		Thumbnail:  thumbnailPath, // URL gambar masuk ke sini
	}

	// 5. Simpan ke database
	if err := config.DB.Create(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat artikel"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Artikel berhasil dibuat beserta gambarnya",
		"data":    post,
	})
}

// Update Artikel
func UpdatePost(c *gin.Context) {
	id := c.Param("id")

	// 1. Ambil ID dan Role pengakses dari Token JWT
	userID, _ := c.Get("user_id")
	roleID, _ := c.Get("role_id")

	var post models.Post
	if err := config.DB.First(&post, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Artikel tidak ditemukan"})
		return
	}

	// 2. KUNCI KEAMANAN: Jika bukan Superadmin (1), cek kepemilikan artikel
	// Kita konversi userID ke uint karena di database tipe ID adalah uint
	if roleID.(float64) != 1 && post.AuthorID != uint(userID.(float64)) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak! Anda hanya boleh mengedit artikel sendiri"})
		return
	}

	var input struct {
		Title      string `json:"title"`
		Slug       string `json:"slug"`
		Content    string `json:"content"`
		Status     string `json:"status"`
		CategoryID uint   `json:"category_id"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	config.DB.Model(&post).Updates(models.Post{
		Title:      input.Title,
		Slug:       input.Slug,
		Content:    input.Content,
		Status:     input.Status,
		CategoryID: input.CategoryID,
	})

	c.JSON(http.StatusOK, gin.H{"message": "Artikel berhasil diupdate", "data": post})
}

// Hapus Artikel
func DeletePost(c *gin.Context) {
	id := c.Param("id")
	
	// 1. Ambil ID dan Role pengakses dari Token JWT
	userID, _ := c.Get("user_id")
	roleID, _ := c.Get("role_id")

	var post models.Post
	if err := config.DB.First(&post, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Artikel tidak ditemukan"})
		return
	}

	// 2. KUNCI KEAMANAN: Jika bukan Superadmin (1), cek kepemilikan sebelum menghapus
	if roleID.(float64) != 1 && post.AuthorID != uint(userID.(float64)) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak! Anda hanya boleh menghapus artikel sendiri"})
		return
	}

	// 3. Eksekusi hapus jika lolos pemeriksaan
	if err := config.DB.Delete(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus artikel"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Artikel berhasil dihapus"})
}

// Fungsi untuk halaman publik (Tanpa Middleware, khusus artikel "published")
func GetPublicPosts(c *gin.Context) {
	var posts []models.Post
	
	// Tarik data artikel dari database, filter hanya yang 'published', dan urutkan dari yang terbaru (opsional)
	if err := config.DB.Preload("Author").Where("status = ?", "published").Order("created_at desc").Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data artikel"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Berhasil mengambil artikel publik",
		"data":    posts,
	})
}