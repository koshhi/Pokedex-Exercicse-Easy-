var inputId;
var obj;
//$(document).ready(function(){
	console.log(inputId)
	$('#searchBtn').on("click",function(e){
		e.preventDefault();
		$('#pokedexRow').empty();
		//previene la recarga de la pagina al hacer click sobre el boton.
		inputId = $('#searchField').val();
		//obtiene el valor del input cuando hagamos clic en el boton. Antes no puede ser ya que el campo estaria vacio.
		$.ajax({
			url: 'http://pokeapi.co/api/v2/pokemon/'+inputId+'/',
			error: function() {
				console.log('error!')
		},
			success: function(data) {
				console.log(data);
				obj = data;
				var name = data.name;
				var image = data.sprites.front_default;
				var type = '';/*'type '+data.types[0].type.name+' and '+data.types[1].type.name*/
				var typeLength = data.types.length;
				for (var i = 0; i < typeLength; i++) {
					type = type + data.types[i].type.name+', '
				}
				getData(inputId, name, image, type.substring(0, type.length - 2));	
				}, // do something with the response
			dataType: 'json'
		});
	});

	function getData(inputId, name, image, type){
		$.ajax({
			url: 'http://pokeapi.co/api/v1/pokemon/'+inputId+'/',
			error: function() {
				console.log('error!');
			},
			success: function(data) {
				console.log (data);
				var resourcesUri = data.descriptions[0].resource_uri;
				
				$.ajax({
					url: 'http://pokeapi.co'+resourcesUri,

					error: function() {
						console.log('error!')
					},
					success: function(data) {
						var pokeCard = '<div class="col-4 pokemon-card"><div class="container"><img src="'+ image +'" alt="pokemon"><h2>'+ name +'</h2><p>'+ data.description +'</p><p>Pokemon type:<br><strong>'+type+'</strong></p></div></div>';
						if ($('#pokedexRow').length > 0 ) {
						$('#pokedexRow').empty();
						}
						$('#pokedexRow').append(pokeCard);		

					}, // do something with the response
					dataType: 'json'
				});

			}, // do something with the response
			dataType: 'json'
		});
	}

	//incluimos un select
	$.ajax({
		url: 'http://pokeapi.co/api/v2/type/',

		error: function() {
			console.log('error!')
		},
		success: function(data) {
			console.log(data)
			objSelect = data;//variable global para poder usarla desde consola
			pokemonTypeLength = data.results.length;

			//for method
/*			for (i=0; i <= pokemonTypeLength; i++) {
				$('#pokemonType').append('<option value="'+data.results[i].name+'">'+data.results[i].name+'</option>)');
			}*/

			//forEach method
			data.results.forEach(function(element){ //data.result[i] --> element
				$('#pokemonType').append('<option value="'+element.name+'" id="'+element.name+'">'+element.name+'</option>');
			});
			
			$('#pokemonType').change(function() {
				var typeValue = $('#pokemonType').val();
  				$.get( 'http://pokeapi.co/api/v2/type/' + typeValue , function( data ) {
	  				objType = data;
	  				var pokemonLength = data.pokemon.length
	  				var pokemonTypeList = '';
	  				for (i=0; i < pokemonLength; i++) {
	  					pokemonTypeList = pokemonTypeList +' '+ data.pokemon[i].pokemon.name;

	  				}
				});
			});	
		}, // do something with the response
		dataType: 'json'
	});

	$('')

//});
