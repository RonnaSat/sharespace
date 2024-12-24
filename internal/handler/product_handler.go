package handler

import (
	"net/http"

	"gorepositorytest/internal/models"
	"gorepositorytest/internal/repository"

	"github.com/labstack/echo/v4"
)

func GetAllProducts(repo repository.ProductRepository) echo.HandlerFunc {
	return func(c echo.Context) error {
		products := repo.GetAll()
		return c.JSON(http.StatusOK, products)
	}
}

func AddProduct(repo repository.ProductRepository) echo.HandlerFunc {
	return func(c echo.Context) error {
		var product models.Product
		if err := c.Bind(&product); err != nil {
			return err
		}
		if err := repo.Create(product); err != nil {
			return err
		}
		return c.JSON(http.StatusCreated, product)
	}
}
