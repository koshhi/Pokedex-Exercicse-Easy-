// Almacena el elemento input que contendrá la ID o nombre del pokemon
var pokemonInput = $("#searchField");
// Alamacena el elemento que contendrá las cartas de los distintos pokemons
var pokedexRow = $('#pokedexRow');
// Alamacena el elemento button de la búsqueda
var searchButton = $("#searchBtn");
// Almacena el elemento select que contendrá todos los tipos de pokemons
var pokemonFilter = $("#pokemonType");
// Almacena el elemento button que mostrará los pokemons guardados
var viewSavedButton = $("#viewSavedBtn");
// Variables del modal de bootstrap
var modalTitle = $("#pokemonModalTitle");
var modalImage = $("#pokemonModalImage");
var modalDesc = $("#pokemonModalDescription");
var modalType = $("#pokemonModalType");
var modalEvoBtn = $("#modalEvoBtn");
var modalSaveBtn = $("#modalSaveBtn");

var Pokemon = function(id, name, description, type, imageUrl, evoId) {
	this.id = id;
	this.name = name;
	this.description = description;
	this.type = type;
	this.imageUrl = imageUrl;
	this.evoId = evoId;
}

// -- Funciones para mostrar u ocultar Modals --

function showPokemonModal() {
	$("#pokemonModal").modal("show");
}

function hidePokemonModal() {
	$("#pokemonModal").modal("hide");
}

function showProgressModal() {
	$("#processModal").modal("show");
}

function hideProgressModal() {
	$("#processModal").modal("hide");
}

// -----------------------------------------------


// -- Funciones para mostrar u ocultar mensajes de alerta

function showAlert(title, message, alertId) {
	var alertHtml = "<strong>"+title+"</strong> "+message;
	$(alertId).removeAttr("hidden");
	$(alertId).empty();
	$(alertId).append(alertHtml);
}

function hideModalAlert(alertId) {
	$(alertId).attr("hidden", "hidden");
}

// -----------------------------------------------


// Función que se encarga de buscar el pokemon y obtener sus datos para posteriormente mostrarlo
function getPokemon(url, modal) {
	var pokemonId = getPokemonId(url);

	$.ajax({
		url: url,
		error: function() {
			console.log('error!')
		},
		success: function(data) {
			var name = data.name;
			var image = data.sprites.front_default;
			var type = '';
			var typeLength = data.types.length;
			for (var i = 0; i < typeLength; i++) {
				type = type + data.types[i].type.name+', '
			}

			var pokemon = new Pokemon(pokemonId, name, "", type.substring(0, type.length - 2), image, "");
			setPokemonDescription(pokemon, modal);
		},
		dataType: 'json'
	});
}

// Función que devuelve la ID del pokemon mediante la URL dada
function getPokemonId(url) {
	return url.split("http://pokeapi.co/api/v2/pokemon/")[1].split("/")[0].trim();
}

// Función que se encarga de obtener la descripción del pokemon
function setPokemonDescription(pokemon, modal) {
	$.ajax({
		url: 'http://pokeapi.co/api/v1/pokemon/'+pokemon.id+'/',
		error: function() {
			console.log('error!');
		},
		success: function(data) {
			var evoId = "";

			if(data.evolutions.length > 0) {
				evoId = data.evolutions[0].resource_uri.split("/api/v1/pokemon/")[1].split("/")[0];
			}

			if(data.descriptions.length > 0) {
				var resourcesUri = data.descriptions[0].resource_uri;

				$.ajax({
					url: 'http://pokeapi.co'+resourcesUri,

					error: function() {
						console.log('error!')
					},
					success: function(data) {
						description = data.description;
						pokemon.description = description;
						pokemon.evoId = evoId;
						addPokemon(pokemon, modal);
					}, // do something with the response
					dataType: 'json'
				});
			}
			else {
				pokemon.description = "";
				pokemon.evoId = evoId;
				addPokemon(pokemon, modal);
			}

		}, // do something with the response
		dataType: 'json'
	});
}

// Función que que añade el pokemon a la lista o lo muestra en un modal
function addPokemon(pokemon, modal) {
	if(!modal) {
		var pokeCard = "";

		if(pokemon.evoId.trim() !== ""){
			pokeCard = '<div class="col-4 pokemon-card"><div class="container" data-pokemon="'+pokemon.id+'"><img src="'+ pokemon.imageUrl +'" alt="pokemon"><h2>'+ pokemon.name +'</h2><p>'+ pokemon.description +'</p><p>Pokemon type:<br><strong>'+pokemon.type+'</strong></p><button id="modalEvoBtn" class="btn btn-primary" data-evo="'+pokemon.evoId+'">Evolution</button><button id="saveBtn" class="btn btn-danger" style="margin-left: 10px;" data-evo="'+pokemon.evoId+'">Save</button><br><br></div></div>';
		}
		else {
			pokeCard = pokeCard = '<div class="col-4 pokemon-card"><div class="container" data-pokemon="'+pokemon.id+'"><img src="'+ pokemon.imageUrl +'" alt="pokemon"><h2>'+ pokemon.name +'</h2><p>'+ pokemon.description +'</p><p>Pokemon type:<br><strong>'+pokemon.type+'</strong></p><button id="saveBtn" class="btn btn-danger" style="margin-left: 10px;" data-evo="'+pokemon.evoId+'">Save</button><br><br></div></div>';
		}

		pokedexRow.append(pokeCard);
	}
	else{
		modalTitle.text(pokemon.name);
		modalTitle.attr("data-id", pokemon.id);
		modalImage.prop("src", pokemon.imageUrl);
		modalDesc.text(pokemon.description);
		modalType.text(pokemon.type);

		if(pokemon.evoId.trim() !== ""){
			modalEvoBtn.removeAttr("hidden");
			modalEvoBtn.attr("data-evo", pokemon.evoId);
		}
		else {
			modalEvoBtn.prop("hidden", "hidden");
		}

		modalSaveBtn.removeAttr("hidden");
		hideProgressModal();
		showPokemonModal();
	}
	hideProgressModal();
}

// Función que añade los tipos de pokemons al elemento select
function getPokemonTypes() {
	$.ajax({
		url: 'http://pokeapi.co/api/v2/type/',

		error: function() {
			console.log('error!')
		},
		success: function(data) {
			var pokemonTypeLength = data.results.length;
		
			for (i=0; i < pokemonTypeLength; i++) {
				pokemonFilter.append('<option value="'+data.results[i].name+'">'+data.results[i].name+'</option>)');
			}

			//forEach method
			/*data.results.forEach(function(element){ //data.result[i] --> element
				$('#pokemonType').append('<option value="'+element.name+'" id="'+element.name+'">'+element.name+'</option>');
			});*/
		},
		dataType: 'json'
	});
}



// Evento que obtendrá la evolución del pokemon mostrado en el modal
$("#modalEvoBtn").on("click", function(e) {
	e.preventDefault();

	hidePokemonModal();
	showProgressModal();
	getPokemon("http://pokeapi.co/api/v2/pokemon/" + modalEvoBtn.attr("data-evo"), true);
});

// Evento que buscará el pokemon por su ID/nombre al hacer clic en el botón buscar
searchButton.on("click", function(e){
	e.preventDefault();

	showProgressModal();
	getPokemon('http://pokeapi.co/api/v2/pokemon/'+pokemonInput.val()+'/', true);
});

// Rellena el elemento select con los distintos tipos de pokemons
getPokemonTypes();

// Evento que mostrará todos los pokemons del tipo seleccionado en el elemento select
pokemonFilter.change(function() {
	var typeValue = $('#pokemonType').val();

	if(typeValue !== "-- Ninguno --") {
		if(pokedexRow.length > 0)
			pokedexRow.empty();

		showProgressModal();

		$.get( 'http://pokeapi.co/api/v2/type/' + typeValue , function( data ) {
			if(data.pokemon != null && data.pokemon.length > 0) {
				var pokemonLength = data.pokemon.length
				for (i=0; i < 10; i++) {
					getPokemon(data.pokemon[i].pokemon.url);
				}
			}
		});
	}	
});

// Evento que obtendrá la evolución del pokemon mostrado en la lista
pokedexRow.on("click", "#modalEvoBtn", function(e) {
	e.preventDefault();

	hidePokemonModal();
	showProgressModal();
	getPokemon("http://pokeapi.co/api/v2/pokemon/" + $(this).attr("data-evo"), true);
});

// Evento que obtendrá la evolución del pokemon mostrado en la lista
pokedexRow.on("click", "#saveBtn", function(e) {
	e.preventDefault();

	var evo = "";

	if($(this).attr("data-evo") !== undefined){
		evo = $(this).attr("data-evo");
	}

	var id = $(this).parent().attr("data-pokemon");
	var name = $(this).parent().children("h2").text();
	var desc = $(this).parent().children("p:first").text();
	var type = $(this).parent().children("p").eq(1).children("strong").text();
	var image = $(this).parent().children("img").attr("src");

	var pokemon = new Pokemon(id, name, desc, type, image, evo);
	sessionStorage.setItem(id, JSON.stringify(pokemon));

	showAlert("Success!", "Pokemon saved successfully!", "#resultAlert");
	$(this).attr("hidden", "hidden");
	setTimeout(function(){ hideModalAlert("#resultAlert") }, 3000);
});

// Evento que guardará en sessionStorage los pokemons que se muestran en los modales
modalSaveBtn.on("click", function(e) {
	e.preventDefault();

	var evo = "";

	if(modalEvoBtn.attr("data-evo") !== undefined){
		evo = modalEvoBtn.attr("data-evo");
	}

	var pokemon = new Pokemon(modalTitle.attr("data-id"), modalTitle.text(), modalDesc.text(), modalType.text(), modalImage.attr("src"), evo);
	sessionStorage.setItem(modalTitle.attr("data-id"), JSON.stringify(pokemon));

	showAlert("Success!", "Pokemon saved successfully!", "#modalAlert");
	$(this).attr("hidden", "hidden");
	setTimeout(function(){ hideModalAlert("#modalAlert") }, 3000);
});

// Evento que mostrará los pokemons guardados
viewSavedButton.on("click", function(e) {
	var keys = Object.keys(sessionStorage);

	pokedexRow.empty();

	for(var i = 0; i < keys.length; i++) {
		var pokemon = JSON.parse(sessionStorage.getItem(keys[i]));
		addPokemon(pokemon, false);
	}
});