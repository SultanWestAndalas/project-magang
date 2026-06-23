package config

import (
	"log"

	"backend-go/models" // Sesuaikan dengan nama module di go.mod kamu

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	// Pastikan username, password, dan nama database sesuai dengan komputermu
	dsn := "root:@tcp(127.0.0.1:3306)/rai_db?charset=utf8mb4&parseTime=True&loc=Local"

	database, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Gagal terhubung ke database MySQL:", err)
	}

	// Lakukan Auto Migrate untuk membuat tabel berdasarkan Struct di models
	err = database.AutoMigrate(
		&models.Role{},
		&models.Permission{},
		&models.User{},
		&models.Category{},
		&models.Tag{},
		&models.Post{},
		&models.UserProgress{},
		&models.Quiz{},
	)

	if err != nil {
		log.Fatal("Gagal melakukan migrasi database:", err)
	}

	DB = database
	log.Println("Koneksi dan Migrasi Database MySQL berhasil!")
}
