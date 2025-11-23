import Order from '../models/order.model.js';

/**
 * Eliminar órdenes canceladas después de X días
 * @param {number} daysOld - Días de antigüedad para eliminar (default: 30)
 */
export const cleanupCancelledOrders = async (daysOld = 30) => {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        
        const result = await Order.deleteMany({
            status: 'cancelada',
            updatedAt: { $lt: cutoffDate }
        });
        
        if (result.deletedCount > 0) {
            console.log(`🧹 Limpieza automática: ${result.deletedCount} órdenes canceladas eliminadas (más de ${daysOld} días)`);
        }
        
        return result.deletedCount;
    } catch (error) {
        console.error('❌ Error en limpieza automática:', error.message);
        throw error;
    }
};

/**
 * Iniciar el job de limpieza periódica
 * Se ejecuta cada 24 horas
 */
export const startCleanupJob = () => {
    const INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 horas
    const DAYS_TO_KEEP = 30; // Mantener órdenes canceladas por 30 días
    
    console.log(`🕐 Job de limpieza iniciado. Se ejecutará cada 24 horas.`);
    console.log(`📅 Órdenes canceladas serán eliminadas después de ${DAYS_TO_KEEP} días.`);
    
    // Ejecutar inmediatamente al iniciar
    cleanupCancelledOrders(DAYS_TO_KEEP);
    
    // Programar ejecución periódica
    setInterval(() => {
        cleanupCancelledOrders(DAYS_TO_KEEP);
    }, INTERVAL_MS);
};