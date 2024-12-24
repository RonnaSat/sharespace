package middleware

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func RegisterMiddlewares(e *echo.Echo) {
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
}

func Authenticate(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		authHeader := c.Request().Header.Get("Authorization")
		if authHeader == "" {
			return c.JSON(http.StatusUnauthorized, map[string]string{"message": "missing or malformed jwt"})
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")
		if token != "12352" {
			return c.JSON(http.StatusUnauthorized, map[string]string{"message": "invalid token"})
		}

		return next(c)
	}
}
