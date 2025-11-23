inventariosync, sigea

Se asumio que la id de los productos sera por numero
***campos: productId, productName, quantity (stock), location (almacen), lastRestockDate (se actualiza cuando recibe/quita stock)** 
createdAt, 
updatedAt, status (estado)  
    *Los estados son 4: Disponible, stock bajo, agotado y descontinuado 
        Disponible= stock>=5
        Stock Bajo= stock<=4
        agotado= stock=0
        descontinuado= no hay logica aun xd
** Si no me equivoco, tengo la conexion con el modulo Producto comentada, lo descomentas y conectas con el modulo, 
aunque probablemente necesites otra logica de la básica que se tiene actualmente 
Los almacenes tienen su propio crud, con id obviamente autoincremental
***campos: warehouseId, name, address, createdAt, updatedAt**
Se puede modificar stock usando add (con id=1) y substract (con id=2), en el swagger estan predefinidos

** Inclui una logica que está pensada para conectarse con Orders, que al momento de recibir una orden, descuente stock,
o que avise si es que el stock es insuficiente (seguro que tienes que cambiar la logica, pues es muy general) 


Se puede acceder a swagger para probar todo: 
3002:/api-docs
El Index.html no funciona xd, osea, lo hace parcialmente, pero como dijiste que lo modificarías todo igual, pues ya pa que. 
se puede acceder al index directamente desde el puerto principal, duh 