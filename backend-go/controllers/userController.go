package controllers

import (
	"backend-go/config"
	"backend-go/models"
	"net/http"
	"time" 

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5" 
	"golang.org/x/crypto/bcrypt"
)

// Struct khusus untuk menangkap data dari JSON
type RegisterInput struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
	RoleID   uint   `json:"role_id" binding:"required"`
}

func RegisterUser(c *gin.Context) {
	var input RegisterInput

	// 1. Tangkap data dari request body
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 2. Hash password menggunakan bcrypt
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengenkripsi password"})
		return
	}

	// 3. Masukkan data ke model User
	user := models.User{
		Username:     input.Username,
		Email:        input.Email,
		PasswordHash: string(hashedPassword),
		RoleID:       input.RoleID,
	}

	// 4. Simpan ke database
	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan user, pastikan email/username unik"})
		return
	}

	// 5. Beri respons sukses (tanpa mengembalikan password)
	c.JSON(http.StatusCreated, gin.H{
		"message": "Registrasi user berhasil",
		"data": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"role_id":  user.RoleID,
		},
	})
}

// Struct untuk menangkap input login
type LoginInput struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func LoginUser(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 1. Cari user berdasarkan Email
	var user models.User
	if err := config.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email atau password salah"})
		return
	}

	// 2. Bandingkan password yang dikirim dengan password hash di database
	err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email atau password salah"})
		return
	}

	// 3. Buat JWT Token (Berlaku 24 Jam)
	// Kita simpan user_id dan role_id di dalam token ini
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"role_id": user.RoleID,
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
	})

	// "RAHASIA_CMS_RAI_123" adalah kunci rahasia (Secret Key). Di dunia nyata, ini disimpan di file .env
	tokenString, err := token.SignedString([]byte("RAHASIA_CMS_RAI_123"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat token"})
		return
	}

	// 4. Kirim token ke frontend
	c.JSON(http.StatusOK, gin.H{
		"message": "Login berhasil",
		"token":   tokenString,
		"role_id": user.RoleID,
	})
}

// Fungsi untuk mengambil daftar semua pengguna
func GetUsers(c *gin.Context) {
	var users []models.User
	
	// Mengambil semua data user.
	// Kita gunakan Preload("Role") agar GORM otomatis menarik nama jabatannya (Super Admin / Penulis)
	if err := config.DB.Preload("Role").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data pengguna"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Berhasil mengambil data pengguna",
		"data":    users,
	})
}

// Fungsi untuk menghapus pengguna
func DeleteUser(c *gin.Context) {
	id := c.Param("id")
	var user models.User

	// Cari apakah user dengan ID tersebut ada di database
	if err := config.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pengguna tidak ditemukan"})
		return
	}

	// Lakukan proses penghapusan
	if err := config.DB.Delete(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus pengguna"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Pengguna berhasil dihapus"})
}