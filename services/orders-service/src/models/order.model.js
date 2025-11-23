import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: [true, 'El ID del producto es obligatorio'],
        trim: true
    },
    productName: {
        type: String,
        required: [true, 'El nombre del producto es obligatorio'],
        trim: true
    },
    quantity: {
        type: Number,
        required: [true, 'La cantidad es obligatoria'],
        min: [1, 'La cantidad debe ser al menos 1']
    },
    price: {
        type: Number,
        required: [true, 'El precio es obligatorio'],
        min: [0, 'El precio no puede ser negativo']
    }
}, { _id: false });

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: [true, 'El ID del usuario es obligatorio'],
            trim: true,
            index: true
        },
        items: {
            type: [orderItemSchema],
            required: [true, 'Los items son obligatorios'],
            validate: {
                validator: function (items) {
                    return items && items.length > 0;
                },
                message: 'La orden debe contener al menos un producto'
            }
        },
        totalAmount: {
            type: Number,
            required: [true, 'El monto total es obligatorio'],
            min: [0, 'El monto total no puede ser negativo']
        },
        status: {
            type: String,
            enum: {
                values: ['pendiente', 'pagada', 'enviada', 'entregada', 'cancelada'],
                message: 'Estado no válido'
            },
            default: 'pendiente',
            index: true
        },
        shippingAddress: {
            type: String,
            required: [true, 'La dirección de envío es obligatoria'],
            trim: true,
            minlength: [10, 'La dirección debe tener al menos 10 caracteres'],
            maxlength: [500, 'La dirección no puede exceder los 500 caracteres']
        },
        // Información de auditoría
        userEmail: {
            type: String,
            trim: true
        },
        userName: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Índices compuestos para mejorar rendimiento
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

// Método para calcular el total automáticamente
orderSchema.methods.calculateTotal = function () {
    this.totalAmount = this.items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);
};

// Pre-save hook para calcular el total antes de guardar
orderSchema.pre('save', function (next) {
    if (this.isNew || this.isModified('items')) {
        this.calculateTotal();
    }
    next();
});

// Método para verificar si la orden puede ser cancelada
orderSchema.methods.canBeCancelled = function () {
    return this.status === 'pendiente';
};

// Método para verificar si el usuario es dueño de la orden
orderSchema.methods.belongsToUser = function (userId) {
    return this.userId === userId;
};

export default mongoose.model('Order', orderSchema);