package controllers

import (
	"backend-go/config"
	"backend-go/models"
	"net/http"
	"os"
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
	if roleID.(float64) != 1 && post.AuthorID != uint(userID.(float64)) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak! Anda hanya boleh mengedit artikel sendiri"})
		return
	}

	// 3. Ambil data teks dari form (bukan JSON)
	title := c.PostForm("title")
	slug := c.PostForm("slug")
	content := c.PostForm("content")
	status := c.PostForm("status")
	categoryIDStr := c.PostForm("category_id")
	categoryID, _ := strconv.Atoi(categoryIDStr)

	// 4. LOGIKA UPDATE GAMBAR (Opsional)
	thumbnailPath := post.Thumbnail // Default: gunakan jalur gambar yang lama

	file, err := c.FormFile("thumbnail")
	if err == nil { // Jika penulis mengunggah file gambar BARU saat edit
		extension := filepath.Ext(file.Filename)
		newFileName := strconv.FormatInt(time.Now().Unix(), 10) + extension
		savePath := "./uploads/" + newFileName
		
		// Simpan file baru ke server, dan perbarui jalur thumbnail
		if err := c.SaveUploadedFile(file, savePath); err == nil {
			thumbnailPath = "/uploads/" + newFileName 
		}
	}

	// 5. Update data ke database
	config.DB.Model(&post).Updates(models.Post{
		Title:      title,
		Slug:       slug,
		Content:    content,
		Status:     status,
		CategoryID: uint(categoryID),
		Thumbnail:  thumbnailPath, // Update dengan gambar baru (atau tetap yang lama jika tidak ada file baru)
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

	// === LOGIKA BARU: Hapus File Gambar Fisik ===
	if post.Thumbnail != "" {
		filePath := "." + post.Thumbnail // Mengubah "/uploads/xxx.jpg" menjadi "./uploads/xxx.jpg"
		os.Remove(filePath) // Meminta sistem (Windows/Linux) untuk menghapus file tersebut
	}
	// ============================================

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

// Fungsi untuk mengambil satu artikel publik berdasarkan Slug
func GetPublicPostBySlug(c *gin.Context) {
	slug := c.Param("slug")
	var post models.Post

	// Cari artikel yang statusnya 'published' dan muat data Author-nya
	if err := config.DB.Preload("Author").Where("slug = ? AND status = ?", slug, "published").First(&post).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Artikel tidak ditemukan atau belum diterbitkan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Berhasil mengambil detail artikel",
		"data":    post,
	})
}

// Fungsi untuk mengambil semua kategori (Publik)
func GetPublicCategories(c *gin.Context) {
	var categories []models.Category
	if err := config.DB.Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data kategori"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": categories})
}

// Fungsi untuk menyelesaikan artikel dan klaim XP (Gamifikasi)
func CompletePost(c *gin.Context) {
	// 1. Ambil user_id dari JWT
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// 2. Ambil ID Artikel dari URL
	postIDStr := c.Param("id")
	postID, err := strconv.Atoi(postIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID Artikel tidak valid"})
		return
	}

	// 3. Cek apakah user sudah pernah menyelesaikan artikel ini
	var progress models.UserProgress
	if err := config.DB.Where("user_id = ? AND post_id = ?", userID, postID).First(&progress).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Anda sudah mendapatkan XP dari materi ini."})
		return
	}

	// 4. Jika belum, catat ke tabel user_progress
	newProgress := models.UserProgress{
		UserID: uint(userID.(float64)), // Casting dari tipe float64 JWT
		PostID: uint(postID),
	}
	config.DB.Create(&newProgress)

	// 5. Tambahkan XP ke User & Logika Naik Level
	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User tidak ditemukan"})
		return
	}

	xpGained := 50 // Setiap baca artikel dapat 50 XP
	user.XP += xpGained

	// Logika Duolingo: Naik level setiap 100 XP
	newLevel := (user.XP / 100) + 1
	levelUp := false
	if newLevel > user.Level {
		user.Level = newLevel
		levelUp = true
	}

	config.DB.Save(&user)

	c.JSON(http.StatusOK, gin.H{
		"message":        "Materi selesai! +50 XP ditambahkan.",
		"xp_total":       user.XP,
		"level_sekarang": user.Level,
		"level_up":       levelUp,
	})
}

// Mengambil kuis berdasarkan Post ID
func GetQuizByPost(c *gin.Context) {
	postID := c.Param("id")
	var quizzes []models.Quiz

	// Cari semua soal kuis yang terkait dengan ID Artikel ini
	if err := config.DB.Where("post_id = ?", postID).Find(&quizzes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil kuis"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Berhasil mengambil data kuis",
		"data":    quizzes,
	})
}