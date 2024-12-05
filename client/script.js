var myout = document.querySelectorAll('.galeria-item img')
var popup = document.querySelector('.popup')
var popupImage = document.querySelector('.popup img')
var popupspan = document.querySelector('.close-popup')

var buttonClose =document.querySelector(".close")
var button =document.querySelector(".boton-carrito")

var cerrar =document.querySelector(".cerrar")




button.addEventListener("click",()=>{
    var carrito =document.querySelector(".carrito")
  carrito.classList.add("carrito-Button")
})


buttonClose.addEventListener("click",()=>{
    var carrito =document.querySelector(".carrito")
  carrito.classList.remove("carrito-Button")
})



const cartItemsContainer = document.querySelector('.items-carrito');
const platillosContainer = document.querySelector('.platillos'); // Contenedor padre




platillosContainer.addEventListener('click', (event) => {
  // Verificar si se hizo clic en un botón `.add-icon`
  if (event.target.closest('.add-icon')) {
    const button = event.target.closest('.add-icon');

    // Obtener los datos del platillo correspondiente
    const platillo = button.closest('.platillo');
    const id = platillo.dataset.id; // Obtener el ID del platillo
    const nombre = platillo.querySelector('.nombre strong').textContent;
    const precio = platillo.querySelector('.precio').textContent;

    // Verificar si el platillo ya está en el carrito
    const existingItem = Array.from(cartItemsContainer.children).find(item => {
      return item.dataset.id === id; // Comparar por ID
    });

    if (existingItem) {
      alert("El platillo elegido ya está en el carrito");
    } else {
      
      // Crear el nuevo item para el carrito
      const newCartItem = document.createElement('div');
      newCartItem.classList.add('item-carrito');
      newCartItem.dataset.id = id; 
      newCartItem.innerHTML = `
        <div class="descripcion-item">
          <span class="nombre"><strong>${nombre}</strong></span>
          <span class="precio">${precio}</span>
        </div>
        <div class="incrementar">
          <img class="icon minus" src="images/minus.png" onclick="cantidadMenos(event)">
          <span class="cantidad">1</span>
          <img class="icon plus" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAABHklEQVR4nO2WTUrDUBSFv010UJuI69C6AKEGt6HGuhZnlpYOOuzcn50k4ipMnJlQCdxCCC/JfYlPMsiBOwmBj3veefc+GDVAnQIPwDsQA99SsXwLAf8vgTNgBWTAoaVyYA+c9YXeAKkCWK0ECLpCH6UDW2i5+2WXTvMe0DJc3bmntPccmCttP9GAt8pujtL8u9ZcmcwBOBMna7W0OD8b8AG4bwK/OQS/NIE/HYLjJnBSk15bmdKe2IIvOoAvbcEfDq2OBhmu0CH4tgnsOxogP20DpNDGAfgZ5eI3pduUdlN6q/UFTFHqysLytrV4rYWW53bfh0DxRuukQGm7yd4FPTUBniSZmi53NmeqkSer7VWmUCoVyXC401yZUfy3fgGUCo4V1aA/HAAAAABJRU5ErkJggg==" onclick="cantidadMas(event)">
        </div>
        <div class="trash-item">
          <img class="icon trash" src="images/trash-bin.png" onclick="eliminarItem(event)">
        </div>
      `;

      cartItemsContainer.appendChild(newCartItem);
    }
    // Actualizar el total
    updateTotal();
  }
});




// Función para actualizar el total
function updateTotal() {
    const items = document.querySelectorAll('.item-carrito');
    let total = 0.00;

    items.forEach((item) => {
        const precio = parseFloat(item.querySelector('.precio').textContent.replace('$', ''));
        const cantidad = parseInt(item.querySelector('.cantidad').textContent);
        total += precio * cantidad;
    });

    document.querySelector('.total span:last-child').textContent = `$${total.toFixed(2)}`;
}





function cantidadMenos(event) {
  const item = event.target.closest('.item-carrito');
  const cantidadEl = item.querySelector('.cantidad');
  let cantidad = parseInt(cantidadEl.textContent);
  if (cantidad > 1) { 
      cantidad--;
      cantidadEl.textContent = cantidad;
  }
  updateTotal();
}

function cantidadMas(event) {
  const item = event.target.closest('.item-carrito');
  const cantidadEl = item.querySelector('.cantidad');
  let cantidad = parseInt(cantidadEl.textContent);
  cantidad++;
  cantidadEl.textContent = cantidad;
  updateTotal();
}

function eliminarItem(event) {

  const item = event.target.closest('.item-carrito');  
  if (item) {
    item.remove();
  }
  updateTotal();
}





cerrar.addEventListener("click",()=>{

  fetch('/logout', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
})
.then(response => response.json())
.then(data => {

  alert("proceso exitosamente")
  localStorage.removeItem('datosUsuario'); // Elimina solo el item 'usuario'
   
})
.catch(error => console.error('Error en la solicitud:', error));
})




myout.forEach(item => {
  item.addEventListener('click', () => {
      popup.style.display = 'flex'; 
      popupImage.src = item.src;  
  });
});
popupspan.addEventListener('click', () => {
  popup.style.display = 'none';  // Ocultar el popup
});

var pedido=[]



document.querySelector('.pagar').addEventListener('click',async () => {
  pedido=[]
  var platillos = document.querySelectorAll('.item-carrito');
  var total=0
platillos.forEach(element => {
  const nombre = element.querySelector('.descripcion-item .nombre').textContent.trim();
  const precio = element.querySelector('.descripcion-item .precio').textContent.trim();
  const cantidad = element.querySelector('.cantidad').textContent.trim();
  const id=element.dataset.id; 

pedido.push({
  id:id,
  nombre:nombre,
  precio:precio,
  cantidad:cantidad,
})
total=document.querySelector('.total span:last-child').textContent.replace('$', '')
});

await agregarPedidos(pedido,total)

cartItemsContainer.innerHTML = '';
total=document.querySelector('.total span:last-child').textContent="$0"

});



async function agregarPedidos(detalles,total){

 if (localStorage.getItem('datosUsuario')) {
  const datosGuardados = JSON.parse(localStorage.getItem('datosUsuario'));
 const Userid=datosGuardados.Id

 if(detalles.length >= 1){

   try{
     // Crear el pedido
     const pedidoResponse = await fetch('http://localhost:3000/pedido', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         id_cliente: Userid, 
         total: Number(total)
       })
     });
  
     if (!pedidoResponse.ok) throw new Error('Error al crear el pedido.');
  
     const data = await pedidoResponse.json(); 
   
     for (const detalle of detalles) {
       const detalleResponse = await fetch('http://localhost:3000/pedido_platillos', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           id_pedido: data.insertId,
           id_platillo: detalle.id,
           cantidad: detalle.cantidad
         })
       });
  
       if (!detalleResponse.ok) throw new Error('Error al agregar un platillo al pedido.');
     }
  
     // Confirmación
     alert('Pedido creado exitosamente.');
   } catch (error) {
     console.error('Error al procesar el pedido:', error);
     alert('Hubo un problema al procesar el pedido.');
   }
 }else{
  alert('no tienes ningun platillo en tu carrito');
 }
 }else{
  alert('Lo siento no estas logueado,inicia sesion para poder hacer pedidos ');
 }

}






fetch('http://localhost:3000/platillos')
    .then(response => response.json())
    .then(platillos => {
      const container = document.querySelector('.platillos');
      platillos.map(platillo => {
        const platilloDiv = document.createElement('div');
        platilloDiv.classList.add('platillo');
        platilloDiv.dataset.id = platillo.id_platillo;
        platilloDiv.innerHTML = `
          <div class="Item-descripcion">
            <div class="nombre"><strong>${platillo.nombre_platillo}</strong></div>
            <div class="descripcion">${platillo.descripcion}</div>
            <div class="precio">$${platillo.precio}</div>
          </div>
          <div class="imagen">
            <img src="${platillo.imagen}">
            <div class="add-icon"><strong>+</strong></div>
          </div>
        `;
        container.appendChild(platilloDiv);
      });
    })
    .catch(err => console.error('Error al obtener los platillos:', err));



