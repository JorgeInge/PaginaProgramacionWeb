import mysql from 'mysql2/promise'


const config={
   host: "localhost",
   user: "root",
   password: "root",
   database: "sistema_reservaciones",
   port: 3306,
   connectionLimit: 10,
   charset: 'utf8mb4'
}
let pool;
export async function Myconexion(){
   try{
   pool=  mysql.createPool(config)
  console.log(`se pudo conectar con la bd ${config.database}`)
  return pool;
}catch(err){
   console.log(`no se pudo conectar con la bd ${config.database}`)
}

}
Myconexion().catch((err) => {
   console.error(err);
 });
export { pool as conexion }
