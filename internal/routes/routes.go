package routes

import (
	"gorepositorytest/internal/handler"
	"gorepositorytest/internal/middleware" // Import the middleware package
	"gorepositorytest/internal/repository"

	"github.com/labstack/echo/v4"
)

func SetupUserRoutes(e *echo.Echo, userRepo repository.UserRepository) {
	e.GET("/users", handler.GetAllUsers(userRepo), middleware.Authenticate)
	e.POST("/users", handler.AddUser(userRepo), middleware.Authenticate)
}

func SetupProductRoutes(e *echo.Echo, productRepo repository.ProductRepository) {
	e.GET("/products", handler.GetAllProducts(productRepo), middleware.Authenticate)
	e.POST("/products", handler.AddProduct(productRepo), middleware.Authenticate)
}
