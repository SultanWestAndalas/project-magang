package controllers

import (
	"backend-go/config"
	"backend-go/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Fungsi untuk melihat semua Role
func GetRoles(c *gin.Context) {
	var roles []models.Role
	
	// Mengambil semua data dari tabel roles menggunakan GORM
	if err := config.DB.Find(&roles).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Berhasil mengambil data role",
		"data":    roles,
	})
}

// Fungsi untuk membuat Role baru
func CreateRole(c *gin.Context) {
	var roleInput models.Role

	// Mengambil data JSON yang dikirim dari Frontend / Postman
	if err := c.ShouldBindJSON(&roleInput); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Menyimpan data ke database
	if err := config.DB.Create(&roleInput).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan role"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Role berhasil dibuat",
		"data":    roleInput,
	})
}