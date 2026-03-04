package middleware

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"math/big"
	"net/http"
	"strings"
	"sync"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/peta/backend/config"
)

var (
	cachedKey *ecdsa.PublicKey
	keyOnce   sync.Once
	keyErr    error
)

type jwksResponse struct {
	Keys []struct {
		Kty string `json:"kty"`
		Alg string `json:"alg"`
		X   string `json:"x"`
		Y   string `json:"y"`
	} `json:"keys"`
}

func fetchPublicKey() (*ecdsa.PublicKey, error) {
	url := config.App.SupabaseURL + "/auth/v1/.well-known/jwks.json"
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("apikey", config.App.SupabaseAnonKey)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("fetch jwks: %w", err)
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)

	var jwks jwksResponse
	if err := json.Unmarshal(body, &jwks); err != nil || len(jwks.Keys) == 0 {
		return nil, fmt.Errorf("parse jwks: %w", err)
	}

	k := jwks.Keys[0]
	xBytes, err := base64.RawURLEncoding.DecodeString(k.X)
	if err != nil {
		return nil, fmt.Errorf("decode x: %w", err)
	}
	yBytes, err := base64.RawURLEncoding.DecodeString(k.Y)
	if err != nil {
		return nil, fmt.Errorf("decode y: %w", err)
	}

	return &ecdsa.PublicKey{
		Curve: elliptic.P256(),
		X:     new(big.Int).SetBytes(xBytes),
		Y:     new(big.Int).SetBytes(yBytes),
	}, nil
}

func getPublicKey() (*ecdsa.PublicKey, error) {
	keyOnce.Do(func() {
		cachedKey, keyErr = fetchPublicKey()
	})
	return cachedKey, keyErr
}

func JWTAuth() fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "missing authorization header"})
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "bearer") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid authorization format"})
		}

		tokenString := parts[1]

		pubKey, err := getPublicKey()
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "could not load auth key"})
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodECDSA); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return pubKey, nil
		})

		if err != nil || !token.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid or expired token"})
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid token claims"})
		}

		userID, ok := claims["sub"].(string)
		if !ok || userID == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid user id in token"})
		}

		c.Locals("user_id", userID)
		return c.Next()
	}
}

// GetUserID is a helper to retrieve the authenticated user ID from context
func GetUserID(c *fiber.Ctx) string {
	return c.Locals("user_id").(string)
}
