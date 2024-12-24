package repository

import (
	"gorepositorytest/internal/models"

	"gorm.io/gorm"
)

type UserRepository interface {
	GetAll() []models.User
	Create(user models.User) error
}

type postgresUserRepository struct {
	db *gorm.DB
}

func NewPostgresUserRepository(db *gorm.DB) UserRepository {
	return &postgresUserRepository{db: db}
}

func (r *postgresUserRepository) GetAll() []models.User {
	var users []models.User
	r.db.Find(&users)
	return users
}

func (r *postgresUserRepository) Create(user models.User) error {
	return r.db.Create(&user).Error
}
