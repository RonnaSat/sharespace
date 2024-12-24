package main

import (
	"log"
	"os"

	"gorepositorytest/internal/middleware"
	"gorepositorytest/internal/models"
	"gorepositorytest/internal/repository"
	"gorepositorytest/internal/routes"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/labstack/echo/v4"
)

func main() {
	e := echo.New()
	middleware.RegisterMiddlewares(e)

	db, err := initDatabase()
	if err != nil {
		log.Fatalf("failed to initialize database: %v", err)
	}

	userRepo := repository.NewPostgresUserRepository(db)
	productRepo := repository.NewPostgresProductRepository(db)

	routes.SetupUserRoutes(e, userRepo)
	routes.SetupProductRoutes(e, productRepo)

	if err := e.Start(":8080"); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}

func initDatabase() (*gorm.DB, error) {
	dsn := "host=localhost user=devuser password=devpassword dbname=devdb port=5432 sslmode=disable"
	if envDSN := os.Getenv("DATABASE_DSN"); envDSN != "" {
		dsn = envDSN
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	if err := db.AutoMigrate(&models.User{}); err != nil {
		return nil, err
	}

	if err := db.AutoMigrate(&models.Product{}); err != nil {
		return nil, err
	}

	return db, nil
}
