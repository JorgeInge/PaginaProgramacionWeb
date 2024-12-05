
import express from 'express'
import mysql from "mysql2"
import { conexion } from './configs/database.js'
import cookieParser from 'cookie-parser';
import JWT from 'jsonwebtoken'
const app = express()


app.use(express.json())
app.use(cookieParser());
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../client')));



app.use((req, res, next) => {
        req.conexion = conexion;
        next();
});


app.post('/createReservation',async (req,res)=>{
try {
    const {nombre_persona,
        correo,
        numero_personas,
        fecha_reservacion,
        hora_reservacion,
        telefono,notas}=req.body; 

    const query ='INSERT INTO reservacion (nombre_persona,correo, numero_personas,fecha_reservacion,hora_reservacion,telefono,notas) '
    +'VALUES (?, ?, ?, ?, ?, ?, ?);'
const call=mysql.format(query,
    [
    nombre_persona,
    correo,
    numero_personas,
    fecha_reservacion,
    hora_reservacion,
    telefono,
    notas
])
const [rows,fields]=await conexion.query(call)
} catch (error) {
    res.status(500).send({ error: 'Ocurrió un error al insertar el pedido' });
}

 })


 app.post('/createUser',async (req,res)=>{
    try {
        const {
            email,
            nombre,
            pass
            }=req.body; 

            var existUser=await SearchUser(conexion,email)
        if (existUser === null) {
    
        const query ='INSERT INTO usuario (nombre, email, pass)'
+' VALUES ( ?, ?, ?);'
    const call=mysql.format(query,
        [ nombre,email,pass])
    const [rows,fields]=await conexion.query(call)
    
    if(rows.affectedRows===1){
        res.status(201).send({ message: 'se creo con exito' });
    }
        }else{
            res.status(409).send({ message: 'ya existe una cuenta con este correo' });
        }
    } catch (error) {
        res.status(500).send({ error: 'Ocurrió un error al insertar el pedido' });
    }
    
     })



 app.post('/:id/getAll_pedidos',async (req,res)=>{
        try {
            const { id } = req.params;
    
            // Consulta principal: Obtener todos los pedidos del usuario
            const queryPedidos = 'SELECT * FROM pedidos WHERE id_usuario = ?';
            const callPedidos = mysql.format(queryPedidos, [id]);
            const [rowsPedidos] = await conexion.query(callPedidos);
    
            const arrayPedidocompleto = []; // Array para guardar todos los pedidos con sus platillos
    
            // Iterar sobre cada pedido
            for (const detalles of rowsPedidos) {
                // Consulta secundaria: Obtener platillos de cada pedido
                const queryPlatillos = 'SELECT pedido_platillos.id_pedido,'
    +'platillos.nombre_platillo  as "nombre",'
    +'pedido_platillos.cantidad '
    +'FROM pedido_platillos '
+' left join platillos on  pedido_platillos.id_platillo = platillos.id_platillo where id_pedido = ? ;'
                const callPlatillos = mysql.format(queryPlatillos, [detalles.id_pedido]);
                const [rowsPlatillos] = await conexion.query(callPlatillos);
    
                // Crear el objeto pedido
                const pedido = {
                    idpedido: detalles.id_pedido,
                    fecha_pedido: detalles.fecha_pedido,
                    estado: detalles.estado,
                    platillos: rowsPlatillos, // Directamente asignamos el array de platillos
                };
    
                // Agregar el pedido completo al array
                arrayPedidocompleto.push(pedido);
            }
    
            // Enviar la respuesta con la estructura deseada
            res.status(200).json(arrayPedidocompleto);
        } catch (error) {
            console.error('Error al obtener los pedidos:', error);
            res.status(500).send({ error: 'Ocurrió un error al obtener los pedidos' });
        }
    });    

     app.post('/:id/getAll_Detalles-pedidos',async (req,res)=>{
        try {
    
            const {id}=req.params; 
        
            const query ='select * from pedidos where id_usuario=?'
        const call=mysql.format(query,[id])
        const [rows,fields]=await conexion.query(call)
        
        res.status(202).send(rows)
        } catch (error) {
            res.status(500).send({ error: 'Ocurrió un error al insertar el pedido' });
        }
        
         })


     app.put('/ChangeStatus',async (req,res)=>{
        try {
    
        const {idUser,IdPedido,status}=req.body; 
        
            const query ='UPDATE pedidos SET estado = ? WHERE id_pedido = ? and id_usuario = ?;'
        const call=mysql.format(query,[status,IdPedido,idUser])
        const [rows,fields]=await conexion.query(call)

        if(rows.affectedRows===1){

            res.status(202).send({message:"se edito con exito "})
        }
        
        } catch (err) {
            console.log(err)
            // res.status(500).send({ error: 'Ocurrió un error al insertar el pedido' });
        }
        
         })
    



export const validationPassword= async (conexion,email,password)=>{
    try{    
const query ='SELECT * FROM usuario where email= ? and  pass=?'
const call=mysql.format(query,[email,password])
const [rows,fields]=await conexion.query(call)

if(rows?.length===1){
 return rows[0];
    }else{
        return null
    }
}catch(err){
console.log(err)

    }
} 

//asignacion de cookie
export const TokenAssignment =async(user)=>{
    const token = JWT.sign({ user }, "SECRETKEY", { expiresIn: "1d" });
    return token;
    }
    

 const SearchUser =async (conexion,email)=>{
    try{
        
const query ='SELECT * FROM usuario where email=?'
const call=mysql.format(query,[email])
const [rows,fields]=await conexion.query(call)
if(rows?.length===1){
 return rows[0];
    }else{
        return null
    }
}catch(err){
console.log(err)
}
}



app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await SearchUser(req.conexion, email);

        if (user !== null) {
            const validation = await validationPassword(req.conexion, email, password);

            if (validation) {

                const { id, nombre, email } = user;

                const castedUser = {
                    Id: id,
                    name: nombre,
                    Email: email,
                };

                const token = await TokenAssignment(castedUser);

                // Configura la cookie y envía la respuesta JSON
                res.cookie('access_token', token, {
                    maxAge: 1000 * 60 * 60, // 1 hora
                    // httpOnly: true,
                    secure: false,
                });

              res.status(200).json({ redirect: '/' });
            } else {
                res.status(500).send({ message: 'Error al intentar iniciar sesion' });
            }
        } else {
            res.status(500).send({ message: 'Error al intentar iniciar sesion' });
        }
    } catch (err) {
      
        res.status(500).send({ message: 'Hubo un error al procesar la petición' });
    }
});




app.get('/logout', async(req,res)=>{
    res.clearCookie('access_token', 
        { secure: false}).send({message:"logout succefully"});
   })
   

app.get('/inicioSesion', (req, res) => {
    res.sendFile(path.join(__dirname, '../client', 'inicioSesion.html'));
   
  })

  app.get('/platillos',async (req, res) => {
    try {
        const query ='select * from platillos'
    const call=mysql.format(query)
    const [rows,fields]=await conexion.query(call)
    
    res.status(202).send(rows)
    } catch (error) {
        res.status(500).send({ error: 'Ocurrió un error al insertar el pedido' });
    }
   
  });
  app.post('/pedido',async (req, res) => {
    try {
        const { id_cliente, total } = req.body;
    
        const query = 'INSERT INTO pedidos (id_usuario, total) VALUES (?, ?)';
        const [result] = await conexion.query(query, [id_cliente, total]);

        res.status(202).send({ insertId: result.insertId });
      } catch (error) {
        res.status(500).send({ error: 'Ocurrió un error al insertar el pedido' });
      }
   
  });

  app.post('/pedido_platillos',async (req, res) => {
    try {
        const { id_pedido, id_platillo,cantidad } = req.body;
    
        const query = 'INSERT INTO pedido_platillos (id_pedido, id_platillo, cantidad) VALUES (?, ?, ?)';
        const [result] = await conexion.query(query, [id_pedido, id_platillo,cantidad]);

        res.status(202).send({ insertId: result.insertId });
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Ocurrió un error al insertar el pedido' });
      }
   
  });

 
 app.get('/',(req, res) => {
    res.sendFile(path.join(__dirname, '../client', 'index.html'));
   
  });
 app.listen(3000,()=>{
 console.log(`servidor en puerto ${3000}`)})