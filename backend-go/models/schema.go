package models

import (
	"time"
)

// ==========================================
// MODUL RBAC (Role-Based Access Control)
// ==========================================

type Role struct {
	ID          uint         `gorm:"primaryKey" json:"id"`
	Name        string       `gorm:"type:varchar(50);unique;not null" json:"name"`
	Description string       `gorm:"type:text" json:"description"`
	CreatedAt   time.Time    `json:"created_at"`
	// Relasi ke User (One-to-Many)
	Users       []User       `gorm:"foreignKey:RoleID" json:"users,omitempty"`
	// Relasi ke Permission (Many-to-Many). GORM akan otomatis buat tabel "role_permissions"
	Permissions []Permission `gorm:"many2many:role_permissions;" json:"permissions,omitempty"`
}

type Permission struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	Name        string `gorm:"type:varchar(50);unique;not null" json:"name"`
	Description string `gorm:"type:text" json:"description"`
}

type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	RoleID       uint      `json:"role_id"` // Foreign Key ke tabel Roles
	Username     string    `gorm:"type:varchar(100);unique;not null" json:"username"`
	Email        string    `gorm:"type:varchar(100);unique;not null" json:"email"`
	PasswordHash string    `gorm:"type:varchar(255);not null" json:"-"` // Tag json:"-" mengunci password agar TIDAK BISA diintip oleh frontend
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	
	// === TAMBAHAN UNTUK GAMIFIKASI (FITUR ALA DUOLINGO) ===
	XP           int       `json:"xp" gorm:"default:0"`
	Level        int       `json:"level" gorm:"default:1"`
	
	// Relasi ke Role (Belongs To) - WAJIB ADA AGAR .Preload("Role") BERHASIL
	Role         Role      `gorm:"foreignKey:RoleID" json:"role"`
	
	// Relasi ke Post (One-to-Many, 1 User bisa buat banyak Post)
	Posts        []Post    `gorm:"foreignKey:AuthorID" json:"posts,omitempty"`
}

// ==========================================
// MODUL GAMIFIKASI (Progress Tracker)
// ==========================================
type UserProgress struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	UserID      uint      `json:"user_id"`
	PostID      uint      `json:"post_id"`
	CompletedAt time.Time `json:"completed_at" gorm:"autoCreateTime"`
}

// ==========================================
// MODUL CMS (Content Management System)
// ==========================================

type Category struct {
	ID          uint   `gorm:"primaryKey"`
	Name        string `gorm:"type:varchar(100);not null"`
	Slug        string `gorm:"type:varchar(100);unique;not null"`
	Description string `gorm:"type:text"`
	// Relasi ke Post (One-to-Many)
	Posts       []Post `gorm:"foreignKey:CategoryID"`
}

type Tag struct {
	ID    uint   `gorm:"primaryKey"`
	Name  string `gorm:"type:varchar(50);not null"`
	Slug  string `gorm:"type:varchar(50);unique;not null"`
}

type Post struct {
	ID         uint      `gorm:"primaryKey"`
	AuthorID   uint      // Foreign Key ke tabel Users
	CategoryID uint      // Foreign Key ke tabel Categories
	Title      string    `gorm:"type:varchar(255);not null"`
	Slug       string    `gorm:"type:varchar(255);unique;not null"`
	Content    string    `gorm:"type:text;not null"`
	Thumbnail  string    `gorm:"type:varchar(255)"` // Menyimpan URL atau path gambar
	Status     string    `gorm:"type:enum('draft','published');default:'draft'"`
	CreatedAt  time.Time
	UpdatedAt  time.Time

	// === TAMBAHKAN BARIS INI AGAR PRELOAD BERHASIL ===
	Author     User      `gorm:"foreignKey:AuthorID"`
	
	// Relasi ke Tag (Many-to-Many). GORM akan otomatis buat tabel "post_tags"
	Tags       []Tag     `gorm:"many2many:post_tags;"`
}

// ==========================================
// MODUL KUIS INTERAKTIF (EVALUASI LMS)
// ==========================================
type Quiz struct {
	ID            uint   `json:"id" gorm:"primaryKey"`
	PostID        uint   `json:"post_id"` // Kuis ini milik materi artikel yang mana
	Question      string `json:"question" gorm:"type:text;not null"`
	OptionA       string `json:"option_a" gorm:"not null"`
	OptionB       string `json:"option_b" gorm:"not null"`
	OptionC       string `json:"option_c" gorm:"not null"`
	OptionD       string `json:"option_d" gorm:"not null"`
	CorrectAnswer string `json:"correct_answer" gorm:"type:char(1);not null"` // Isi dengan 'A', 'B', 'C', atau 'D'
}