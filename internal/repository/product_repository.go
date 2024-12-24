package repository

import (
	"gorepositorytest/internal/models"

	"gorm.io/gorm"
)

type ProductRepository interface {
	GetAll() []models.Product
	Create(product models.Product) error
}

type postgresProductRepository struct {
	db *gorm.DB
}

func NewPostgresProductRepository(db *gorm.DB) ProductRepository {
	return &postgresProductRepository{db: db}
}

func (r *postgresProductRepository) GetAll() []models.Product {
	var products []models.Product
	r.db.Find(&products)
	return products
}

func (r *postgresProductRepository) Create(product models.Product) error {
	return r.db.Create(&product).Error
}
