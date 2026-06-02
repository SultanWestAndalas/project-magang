package middlewares

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Ambil token dari header request
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Akses ditolak, token tidak ditemukan!"})
			c.Abort() // Hentikan proses, jangan lanjut ke controller
			return
		}

		// 2. Format token biasanya "Bearer <token acak>". Kita hapus kata "Bearer "-nya.
		tokenString := strings.Replace(authHeader, "Bearer ", "", 1)

		// 3. Parse dan validasi token menggunakan Secret Key yang sama saat login
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte("RAHASIA_CMS_RAI_123"), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token tidak valid atau sudah kedaluwarsa"})
			c.Abort()
			return
		}

		// 4. Jika valid, ambil data user_id dan role_id dari dalam token
		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			// Simpan datanya ke context supaya nanti bisa dibaca oleh Controller (misal saat mau simpan penulis artikel)
			c.Set("user_id", claims["user_id"])
			c.Set("role_id", claims["role_id"])
			
			// Lanjutkan perjalanan request ke Controller tujuan
			c.Next() 
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Gagal membaca data token"})
			c.Abort()
		}
	}
}

// Fungsi untuk membatasi akses berdasarkan ID Role
// Misal: 1 = Super Admin, 2 = Editor, 3 = Penulis
func RequireRole(allowedRoleIDs ...float64) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Ambil role_id yang sudah disimpan oleh middleware RequireAuth() sebelumnya
		userRoleID, exists := c.Get("role_id")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak: Identitas role tidak ditemukan"})
			c.Abort()
			return
		}

		// Penting: JWT selalu membaca angka sebagai float64 di Golang
		roleID := userRoleID.(float64)
		isAllowed := false

		// Cek apakah role_id user ada di dalam daftar role yang diizinkan
		for _, allowedID := range allowedRoleIDs {
			if roleID == allowedID {
				isAllowed = true
				break
			}
		}

		if !isAllowed {
			c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak: Anda tidak memiliki izin untuk tindakan ini"})
			c.Abort()
			return
		}

		c.Next()
	}
}