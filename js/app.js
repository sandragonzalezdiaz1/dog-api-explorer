$(() => {
  let contenedor = document.getElementById("results-container");

  // Función para crear un <li> y añadirlo a la lista
  function crearElementoLista(etiqueta, valor, lista) {
    let item = document.createElement("li");

    let strong = document.createElement("strong");
    strong.textContent = etiqueta + ": ";

    item.appendChild(strong);

    let texto = document.createTextNode(valor);
    item.appendChild(texto);
    lista.appendChild(item);
  }

  // Función para mostrar un mensaje de carga mientras se realiza la petición AJAX
  function mostrarLoader() {
    contenedor.innerHTML = "";
    let parrafo = document.createElement("p");
    parrafo.className = "loader";
    parrafo.textContent = "🐶 Cargando datos...";
    contenedor.appendChild(parrafo);
  }

  function mostrarError(texto) {
    contenedor.innerHTML = "";

    let mensajeError = document.createElement("div");
    mensajeError.className = "error-box";
    mensajeError.textContent = texto;
    contenedor.appendChild(mensajeError);
  }

  $("#breeds-form").submit((event) => {
    event.preventDefault(); // Evitamos el envio del formulario y recargar la pagina
    mostrarLoader();

    let numRazas = document.getElementById("breed-count").value;

    if (isNaN(numRazas) || numRazas < 1 || numRazas > 283) {
      mostrarError("⚠️ El número de razas debe estar entre 1 y 283.");
      return;
    }

    $.ajax({
      url: "https://dogapi.dog/api/v2/breeds?page[size]=" + numRazas,
      type: "GET",
      dataType: "json",
      success: (respuesta) => {
        //console.log(respuesta.data);

        // Limpiamos el contenedor anterior
        contenedor.innerHTML = "";

        if (!respuesta.data || respuesta.data.length === 0) {
          mostrarError(
            "❌🐶 No hay razas disponibles con ese limite de resultados.",
          );
          return;
        }

        respuesta.data.forEach((breed) => {
          let articulo = document.createElement("article");
          let lista = document.createElement("ul");

          // Objeto para traducir las claves de la API
          let etiquetas = {
            life: "Esperanza de vida",
            female_weight: "Peso hembra",
            male_weight: "Peso macho",
          };

          // Recorremos todas las propiedades de breed.attributes
          for (let [clave, valor] of Object.entries(breed.attributes)) {
            //console.log(clave, ":", valor)
            let texto;

            // Si la propiedad es el nombre, la mostramos como título
            if (clave === "name") {
              let titulo = document.createElement("h3");
              titulo.textContent = "🐶 " + valor;
              articulo.appendChild(titulo);
            } else if (clave === "hypoallergenic") {
              // Formateamos el valor booleano para mostrar Sí / No
              texto = `${valor ? "Sí" : "No"}`;
              crearElementoLista("Hipoalergénico", texto, lista);

              // Formateamos los objetos {min, max} para mostrar rangos legibles
            } else if (typeof valor === "object" && valor !== null) {
              let etiqueta = etiquetas[clave] || clave;

              if (clave === "life") {
                texto = `${valor.min} - ${valor.max} años`;
                crearElementoLista(etiqueta, texto, lista);
              } else {
                texto = `${valor.min} - ${valor.max} kg`;
                crearElementoLista(etiqueta, texto, lista);
              }

              // Para cualquier otro valor simple
            } else {
              crearElementoLista("Descripción", valor, lista);
            }
          }

          articulo.appendChild(lista);
          contenedor.appendChild(articulo);
        });
      },
      error: () => {
        mostrarError(
          "⚠️ No se pudieron recuperar las razas de los perros. Inténtalo de nuevo más tarde.",
        );
      },
    });
  });

  $("#show-facts-btn").click(() => {
    mostrarLoader();
    $.ajax({
      url: "https://dogapi.dog/api/v2/facts?limit=5",
      type: "GET",
      dataType: "json",
      success: (respuesta) => {
        //console.log(respuesta.data)

        contenedor.innerHTML = "";

        respuesta.data.forEach((fact) => {
          //console.log(fact.attributes.body)

          let parrafo = document.createElement("p");
          parrafo.className = "fact";
          parrafo.textContent = fact.attributes.body;

          contenedor.appendChild(parrafo);
        });
      },
      error: () => {
        mostrarError(
          "⚠️ No se pudieron recuperar las curiosidades de los perros. Inténtalo de nuevo más tarde.",
        );
      },
    });
  });
});
