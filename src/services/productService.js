// src/services/productService.js
import apiClient from './osimart'

export const productService = {
    async getProduct(id) {
        try {
            const response = await apiClient.get(`/products/${id}/`)
            return this.transformProduct(response.data)
        } catch (error) {
            console.error('Failed to fetch product:', error)
            return null
        }
    },

    async getProducts(params = {}) {
        try {
            const response = await apiClient.get('/products/', { params })
            return response.data
        } catch (error) {
            console.error('Failed to fetch products:', error)
            return null
        }
    },

    transformProduct(product) {
        if (!product) return null
        
        // Get image URL
        let imageUrl = '/placeholder.jpg'
        if (product.main_image) {
            if (typeof product.main_image === 'string') {
                imageUrl = product.main_image
            } else if (product.main_image.path) {
                imageUrl = `https://api.osimart.com/${product.main_image.path}`
            }
        } else if (product.image) {
            if (typeof product.image === 'string') {
                imageUrl = product.image
            } else if (product.image.path) {
                imageUrl = `https://api.osimart.com/${product.image.path}`
            }
        }
        
        // Get price
        let price = 0
        if (product.product_variants && product.product_variants.length > 0) {
            price = product.product_variants[0].price || 0
        }
        if (price === 0 && product.price) {
            price = product.price
        }
        
        // Get stock
        let stock = 0
        if (product.remaining_stock !== undefined) {
            stock = Number(product.remaining_stock) || 0
        } else if (product.stock !== undefined) {
            stock = Number(product.stock) || 0
        }
        
        // Get category
        let category = ''
        let categorySlug = ''
        if (product.categories && product.categories.length > 0) {
            const cat = product.categories[0].category
            if (cat) {
                category = cat.name || ''
                categorySlug = cat.slugified_name || ''
            }
        }
        
        // Get badge
        let badge = 'none'
        if (product.badge) {
            badge = product.badge
        }
        
        // Get images array
        let images = []
        if (product.main_image) {
            images.push(imageUrl)
        }
        if (product.gallery && Array.isArray(product.gallery)) {
            product.gallery.forEach(item => {
                if (item && item.media) {
                    if (typeof item.media === 'string') {
                        images.push(item.media)
                    } else if (item.media.path) {
                        images.push(`https://api.osimart.com/${item.media.path}`)
                    }
                }
            })
        }
        
        // Get variants
        let variants = product.product_variants || []
        let sizes = []
        variants.forEach(v => {
            if (v.values && Array.isArray(v.values)) {
                v.values.forEach(val => {
                    if (val.name && !sizes.includes(val.name)) {
                        sizes.push(val.name)
                    }
                })
            }
        })
        
        return {
            id: product.id || '',
            variant_id: product.product_variants?.[0]?.id || '',
            name: product.name || '',
            slug: product.slugified_name || product.name?.toLowerCase().replace(/\s+/g, '-') || '',
            price: price,
            oldPrice: product.product_variants?.[0]?.compare_at_price || null,
            image: imageUrl,
            images: images,
            category: category,
            category_slug: categorySlug,
            badge: badge,
            stock: stock,
            rating: 5.0,
            review_count: 0,
            description: product.description || '',
            displayText: '',
            features: [],
            tags: [],
            metalType: 'none',
            diamondWeight: '',
            goldWeight: '',
            silverWeight: '',
            chainLength: '',
            ringSize: '',
            gemstone: 'none',
            variants: variants,
            sizes: sizes,
            details: product.details || '',
            is_active: true,
        }
    },

    transformProducts(products) {
        if (!Array.isArray(products)) return []
        return products.map(p => this.transformProduct(p)).filter(p => p !== null)
    }
}