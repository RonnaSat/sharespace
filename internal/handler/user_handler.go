package handler

import (
	"net/http"

	"gorepositorytest/internal/models"
	"gorepositorytest/internal/repository"

	"github.com/labstack/echo/v4"
)

func GetAllUsers(repo repository.UserRepository) echo.HandlerFunc {
	return func(c echo.Context) error {
		users := repo.GetAll()
		return c.JSON(http.StatusOK, users)
	}
}

func AddUser(repo repository.UserRepository) echo.HandlerFunc {
	return func(c echo.Context) error {
		var user models.User
		if err := c.Bind(&user); err != nil {
			return err
		}
		err := repo.Create(user)
		if err != nil {
			return err
		}
		return c.JSON(http.StatusCreated, user)
	}
}
