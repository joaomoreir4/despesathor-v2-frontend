class Despesa {
	constructor(ano, mes, dia, categoria, descricao, valor) {
		this.ano = ano
		this.mes = mes
		this.dia = dia
		this.categoria = categoria
		this.descricao = descricao
		this.valor = valor
	}

	validarDados(){
		for(let i in this){
			if(this[i] == undefined || this[i] == '' || this[i] == null){
				return false
			}
		} return true
	}

	traduzirParaApi(){
		let categoriaTraduzida = traduzirCategoriaApi(this.categoria)
		let mesTraduzido = this.mes.padStart(2, '0')
		let diaTraduzido = this.dia.padStart(2, '0')
		let dataTraduzida = `${this.ano}-${mesTraduzido}-${diaTraduzido}`

		return{
			descricao: this.descricao,
			valor: parseFloat(this.valor),
			categoria: categoriaTraduzida,
			data: dataTraduzida
		}
	}
}

function traduzirCategoriaApi(categoria) {
    switch(categoria){
        case '1': return 'ALIMENTACAO'
        case '2': return 'EDUCACAO'
        case '3': return 'LAZER'
        case '4': return 'SAUDE'
        case '5': return 'TRANSPORTE'
        default: return 'OUTROS'
    }
}

function traduzirCategoriaFront(categoria) {
    switch(categoria){
        case 'ALIMENTACAO': return 'Alimentação'
        case 'EDUCACAO': return 'Educação'
        case 'LAZER': return 'Lazer'
        case 'SAUDE': return 'Saúde'
        case 'TRANSPORTE': return 'Transporte'
        default: return 'Outros'
    }
}

function traduzirMes(mes){
	switch(mes){
        case '01': return 'Janeiro'
        case '02': return 'Fevereiro'
        case '03': return 'Março'
        case '04': return 'Abril'
        case '05': return 'Maio'
        case '06': return 'Junho'
        case '07': return 'Julho'
        case '08': return 'Agosto'
        case '09': return 'Setembro'
        case '10': return 'Outubro'
        case '11': return 'Novembro'
        case '12': return 'Dezembro'
        default: return ''
	}
}

function verificaDados(id) {
    const elemento = document.getElementById(id)
    return elemento ? elemento.value : ''
}

function obterDados(){
	let ano = verificaDados('ano')
	let mes = verificaDados('mes')
	let dia = verificaDados('dia')
	let categoria = verificaDados('categoria')
	let descricao = verificaDados('descricao')
	let valor = verificaDados('valor')
	return {ano, mes, dia, categoria, descricao, valor}
}

function cadastrarDespesa() {
	const dados = obterDados()
	let despesa = new Despesa(dados.ano, dados.mes, dados.dia, dados.categoria, dados.descricao, dados.valor)

	if(!despesa.validarDados()){
		$('#modalRegistraDespesa').modal('show')
		document.getElementById('modalLblDiv').className = 'modal-header text-danger'
		document.getElementById('exampleModalLabel').innerHTML = "Erro na inclusão do registro!"
		document.getElementById('modalMensagem').innerHTML = "Erro na gravação. Verifique se todos os campos foram preenchidos corretamente."
		document.getElementById('modalBtn').innerHTML = "Voltar e corrigir"
		document.getElementById('modalBtn').className = 'btn btn-danger'
		return
	}

	let despesaTraduzida = despesa.traduzirParaApi()

	fetch('http://localhost:8080/despesas', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(despesaTraduzida)
	})
		.then(resposta => { 
        if (!resposta.ok) {
            throw new Error('Erro do servidor: ' + resposta.statusText);
        }
        
        $('#modalRegistraDespesa').modal('show');
        document.getElementById('modalLblDiv').className = 'modal-header text-success';
        document.getElementById('exampleModalLabel').innerHTML = "Registro inserido com sucesso!";
        document.getElementById('modalMensagem').innerHTML = "A despesa foi cadastrada com sucesso";
        document.getElementById('modalBtn').innerHTML = "Voltar";
        document.getElementById('modalBtn').className = 'btn btn-success';
        
    })
    .catch(erro => { 
        console.error('Erro ao salvar despesa:', erro);
        $('#modalRegistraDespesa').modal('show');
        document.getElementById('modalLblDiv').className = 'modal-header text-danger';
        document.getElementById('exampleModalLabel').innerHTML = "Erro na gravação!";
        document.getElementById('modalMensagem').innerHTML = "Não foi possível contactar o servidor. Tente novamente.";
        document.getElementById('modalBtn').innerHTML = "Voltar e corrigir";
        document.getElementById('modalBtn').className = 'btn btn-danger';
    });
}	

function pesquisarDespesa(tipo){
	const dados = obterDados()
	let despesa = new Despesa(dados.ano, dados.mes, dados.dia, dados.categoria, dados.descricao, dados.valor)
	let categoria = traduzirCategoriaApi(despesa.categoria)

	let url = 'http://localhost:8080/despesas'
	if(tipo === 'resumo'){
		url = 'http://localhost:8080/despesas/resumo'
	}
	
	let filtros = []; 

	if(despesa.ano){
		filtros.push(`ano=${despesa.ano}`)
	}
	if(despesa.mes){
		filtros.push(`mes=${despesa.mes}`)
	}
	if (despesa.categoria) {
		filtros.push(`categoria=${categoria}`)
	}

	if (filtros.length > 0) {
		url = url + '?' + filtros.join('&')
	}

	carregaDespesas(url, tipo)
}

function carregaDespesas(url = 'http://localhost:8080/despesas', tipo){
	fetch(url)
		.then(resposta => {
			if(!resposta.ok){
				throw new Error (`Erro de rede: ${resposta.statusText}`)
			}
			return resposta.json()
		})
		.then(apiResposta => {
			if(tipo === 'consulta'){
				exibeConsulta(apiResposta)
			}else{
				exibeResumo(apiResposta)
			}
		})
		.catch(erro => {
			console.error('Erro ao buscar despesas:', erro)
			alert('Não foi possível carregar as despesas')
		})
}

function exibeConsulta(despesas){
	let listaDespesas = document.getElementById('listaDespesas')
	listaDespesas.innerHTML = ''

	despesas.forEach(function(d) {
		let linha = listaDespesas.insertRow()
		const [ano, mes, dia] = d.data.split('-')
		linha.insertCell(0).innerHTML = `${dia}/${mes}/${ano}`
		let categoria = traduzirCategoriaFront(d.categoria)
		linha.insertCell(1).innerHTML = categoria
		linha.insertCell(2).innerHTML = d.descricao
		linha.insertCell(3).innerHTML = d.valor

		let btn = document.createElement("button")
		btn.className = "btn btn-danger"
		btn.innerHTML = "<i class='fas fa-times'></i>"
		btn.id = `id_despesa_${d.id}`

		btn.onclick = function(){
			let id = this.id.replace ('id_despesa_', '')
			$('#modalRemoveDespesa').modal('show')
			document.getElementById('btnE').className = "btn btn-danger"

			document.getElementById('btnE').onclick = function(){
				fetch(`http://localhost:8080/despesas/${id}`, {
					method: 'DELETE'
				})
				.then(resposta => {
					if(!resposta.ok){
						throw new Error('Erro ao apagar a despesa.')
					}
					$('#modalRemoveDespesa').modal('hide')
					btn.closest('tr').remove()
				})
				.catch(erro => {
					console.error('Erro:', erro)
					alert('Falha ao apagar.')
					$('#modalRemoveDespesa').modal('hide')
				})
			}
		}
		linha.insertCell(4).append(btn)
	})
}

function exibeResumo(apiResposta){
	let resumeDespesas = document.getElementById('listaDespesas')
	resumeDespesas.innerHTML = ''

	let ano = verificaDados('ano')
	ano = ano ? ano : "Todos";
	let mes = verificaDados('mes')
	mes = mes ? traduzirMes('0' + mes) : "Todos";
	let categoria = verificaDados('categoria')
	categoria = categoria ? traduzirCategoriaFront(traduzirCategoriaApi(categoria)) : "Todas";
	let valorTotal = apiResposta.valorTotal.toFixed(2)

	let linha = resumeDespesas.insertRow()
	linha.insertCell(0).innerHTML = `${ano}`
	linha.insertCell(1).innerHTML = `${mes}`
	linha.insertCell(2).innerHTML = `${categoria}`
			
	let celulaValor = linha.insertCell(3);
	celulaValor.className = "text-right";
	celulaValor.innerHTML = valorTotal;
}
	

document.addEventListener('DOMContentLoaded', function(){
	const paginaAtual = window.location.pathname
	if(paginaAtual.includes('consulta.html')){
		pesquisarDespesa('consulta')
	}else if(paginaAtual.includes('resumo.html')){
		pesquisarDespesa('resumo')
	}

	formataCampos()
})

function formataCampos() {
    const campoDia = document.getElementById('dia')
	if(campoDia){
		campoDia.addEventListener('input', function (event) {
			let valor = event.target.value
			valor = valor.replace(/[^0-9]/g, '')
			let valorNumerico = parseInt(valor, 10)
			
			if (valorNumerico < 1 && valor.length > 0) {
				valor = '1'
			} else if (valorNumerico > 31) {
				valor = '31'
			}
			event.target.value = valor
		})
	}

    const campoValor = document.getElementById('valor')
	if(campoValor){
		campoValor.addEventListener('input', function (event) {
				let valor = event.target.value
				valor = valor.replace(/[^0-9.]/g, '').replace(/(\..*?)\./g, '$1')
				
				const partes = valor.split('.')
				if (partes.length === 2 && partes[1].length > 2) {
					valor = `${partes[0]}.${partes[1].substring(0, 2)}`
				}
				event.target.value = valor
			});

			campoValor.addEventListener('blur', function (event) {
				let valor = event.target.value

				if (valor === "" || valor.endsWith('.')) {
					return
				}

				let valorNumerico = parseFloat(valor);

				if (!isNaN(valorNumerico)) {
					event.target.value = valorNumerico.toFixed(2)
				}
			})
	}
}
