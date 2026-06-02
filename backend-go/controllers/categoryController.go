package controllers

import (
	"backend-go/config"
	"backend-go/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Mengambil semua kategori
func GetCategories(c *gin.Context) {
	var categories []models.Category
	config.DB.Find(&categories)
	c.JSON(http.StatusOK, gin.H{"data": categories})
}

// Membuat kategori baru
func CreateCategory(c *gin.Context) {
	var input struct {
		Name string `json:"name"`
		Slug string `json:"slug"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	category := models.Category{Name: input.Name, Slug: input.Slug}
	config.DB.Create(&category)
	c.JSON(http.StatusOK, gin.H{"message": "Kategori berhasil dibuat", "data": category})
}

// Update Kategori
func UpdateCategory(c *gin.Context) {
	id := c.Param("id")
	var category models.Category
	if err := config.DB.First(&category, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kategori tidak ditemukan"})
		return
	}

	var input struct {
		Name string `json:"name"`
		Slug string `json:"slug"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	config.DB.Model(&category).Updates(models.Category{Name: input.Name, Slug: input.Slug})
	c.JSON(http.StatusOK, gin.H{"message": "Kategori berhasil diupdate", "data": category})
}

// Hapus Kategori
func DeleteCategory(c *gin.Context) {
	id := c.Param("id")
	var category models.Category
	if err := config.DB.First(&category, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kategori tidak ditemukan"})
		return
	}

	config.DB.Delete(&category)
	c.JSON(http.StatusOK, gin.H{"message": "Kategori berhasil dihapus"})
}