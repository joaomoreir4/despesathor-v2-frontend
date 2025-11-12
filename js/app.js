const CAT_API_PARA_FRONT = {
    'ALIMENTACAO': { id: '1', front: 'Alimentação' },
    'EDUCACAO':    { id: '2', front: 'Educação' },
    'LAZER':       { id: '3', front: 'Lazer' },
    'SAUDE':       { id: '4', front: 'Saúde' },
    'TRANSPORTE':  { id: '5', front: 'Transporte' },
    'OUTROS':      { id: '6', front: 'Outros' }
};

const CAT_ID_PARA_API = {
    '1': 'ALIMENTACAO',
    '2': 'EDUCACAO',
    '3': 'LAZER',
    '4': 'SAUDE',
    '5': 'TRANSPORTE',
    '6': 'OUTROS'
};

function traduzirCatParaApi(id) {
    return CAT_ID_PARA_API[id] || 'OUTROS'
}

function traduzirCatParaFront(categoriaApi) {
    return CAT_API_PARA_FRONT[categoriaApi] ? CAT_API_PARA_FRONT[categoriaApi].front : 'Outros'
}

function traduzirCatParaEdit(categoriaApi) {
    return CAT_API_PARA_FRONT[categoriaApi] ? CAT_API_PARA_FRONT[categoriaApi].id : '6'
}

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
		let categoriaTraduzida = traduzirCatParaApi(this.categoria)
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

function traduzirDataEdit(data){
	let [ano, mes, dia] = data.split('-')
	mes = Number(mes)
	return [ano, mes, dia]
}

function verificaDados(id) {
    const elemento = document.getElementById(id)
    return elemento ? elemento.value : ''
}

function obterDados(modo){
	let ano = 'ano'
	let mes = 'mes'
	let dia = 'dia'
	let categoria = 'categoria'
	let descricao = 'descricao'
	let valor = 'valor'

	if(modo === 'edit'){
		ano = 'editAno'
		mes = 'editMes'
		dia = 'editDia'
		categoria = 'editCategoria'
		descricao = 'editDescricao'
		valor = 'editValor'
	}

	ano = verificaDados(ano)
	mes = verificaDados(mes)
	dia = verificaDados(dia)
	categoria = verificaDados(categoria)
	descricao = verificaDados(descricao)
	valor = verificaDados(valor)
	return new Despesa(ano, mes, dia, categoria, descricao, valor)
}

function cadastrarDespesa() {
	let despesa = obterDados()

	if(!despesa.validarDados()){
		exibirModalFeedback(
            'erro', 
            'Erro no cadastro!', 
            'Erro na gravação. Verifique se todos os campos foram preenchidos corretamente.'
        )
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
        exibirModalFeedback(
            'sucesso', 
            'Registro inserido com sucesso!', 
            'A despesa foi cadastrada com sucesso'
        );
    })
    .catch(erro => { 
        console.error('Erro ao salvar despesa:', erro);
        exibirModalFeedback(
            'erro', 
            'Erro no cadastro!', 
            'Não foi possível contactar o servidor. Tente novamente.'
        );
    });
}	

function pesquisarDespesa(tipo){
	let despesa = obterDados()
	let categoria = traduzirCatParaApi(despesa.categoria)

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

async function carregaDespesas(url = 'http://localhost:8080/despesas', tipo){
	try{
		const resposta = await fetch(url)
		if(!resposta.ok){
			throw new Error (`Erro de rede: ${resposta.statusText}`)
		}
		
		const apiResposta = await resposta.json()
		if(tipo === 'consulta'){
			exibeConsulta(apiResposta)
		}else if(tipo === 'edit'){
			return apiResposta
		}else{
			exibeResumo(apiResposta)
		}
	} catch(erro) {
			console.error('Erro ao buscar despesas:', erro)
			alert('Não foi possível carregar as despesas')
		}
}

function exibeConsulta(despesas){
	let listaDespesas = document.getElementById('listaDespesas')
	listaDespesas.innerHTML = ''

	despesas.forEach(function(d) {
		let linha = listaDespesas.insertRow()
		const [ano, mes, dia] = d.data.split('-')
		linha.insertCell(0).innerHTML = `${dia}/${mes}/${ano}`
		let categoria = traduzirCatParaFront(d.categoria)
		linha.insertCell(1).innerHTML = categoria
		linha.insertCell(2).innerHTML = d.descricao
		linha.insertCell(3).innerHTML = d.valor

		let btn = document.createElement("button")
		btn.className = "btn btn-danger"
		btn.innerHTML = "<i class='fas fa-times'></i>"
		btn.id = `id_deletar_${d.id}`
		btn.onclick = function(){
			removerDespesa(d, this)
		} 

		let btnEdit = document.createElement("button")
		btnEdit.className = "btn btn-primary"
		btnEdit.innerHTML = "<i class='fas fa-edit'></i>"
		btnEdit.onclick = function(){
			editarDespesa(d)
				.catch(erro => {
					console.error("Erro ao tentar carregar a edição:", erro);
					alert("Erro: Não foi possível editar a despesa.");
				});
		}

		linha.insertCell(4).append(btnEdit)
		linha.insertCell(5).append(btn)
	})
}

function removerDespesa(d, btn){
	$('#modalRemoveDespesa').modal('show')
	document.getElementById('btnD').className = "btn btn-danger"

	document.getElementById('btnD').onclick = function(){
		fetch(`http://localhost:8080/despesas/${d.id}`, {
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

async function editarDespesa(d){
	url = `http://localhost:8080/despesas/${d.id}`
	let despesa = await carregaDespesas(url, 'edit')
	let [ano, mes, dia] = traduzirDataEdit(despesa.data)
	let categoria = traduzirCatParaEdit(despesa.categoria)
	document.getElementById('editAno').value = ano
	document.getElementById('editMes').value = mes
	document.getElementById('editDia').value = dia
	document.getElementById('editCategoria').value = categoria
	document.getElementById('editDescricao').value = despesa.descricao
	document.getElementById('editValor').value = despesa.valor
	formataCampos('edit')
	$('#modalEditaDespesa').modal('show')

	document.getElementById('btnU').className = "btn btn-success"
	document.getElementById('btnU').onclick = function(){
		let erro = document.getElementById('editErro')
		erro.classList.add('d-none')

		let despesaEditada = obterDados('edit')
		if(!despesaEditada.validarDados()){
			erro.innerHTML = "Erro: Verifique se todos os campos foram preenchidos."
			erro.classList.remove('d-none')
			return
		}

		despesaEditada = despesaEditada.traduzirParaApi()

		fetch(`http://localhost:8080/despesas/${d.id}`, { 
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(despesaEditada)
		})
		.then(resposta => { 
			if (!resposta.ok) {	
				erro.innerHTML = "Erro: Não foi possível editar a despesa."
				erro.classList.remove('d-none')
				throw new Error('Erro ao editar a despesa.')
			}
			$('#modalEditaDespesa').modal('hide')
			pesquisarDespesa('consulta')
		})
		.catch(erro => {
			console.error('Erro:', erro)
			alert('Ocorreu um erro e não foi possível editar a despesa')
		})
	}
}

function exibeResumo(apiResposta){
	let resumeDespesas = document.getElementById('listaDespesas')
	resumeDespesas.innerHTML = ''

	let ano = verificaDados('ano')
	ano = ano ? ano : "Todos";
	let mes = verificaDados('mes')
	mes = mes ? traduzirMes('0' + mes) : "Todos";
	let categoria = verificaDados('categoria')
	categoria = categoria ? traduzirCatParaFront(traduzirCatParaApi(categoria)) : "Todas";
	let valorTotal = apiResposta.valorTotal.toFixed(2)

	let linha = resumeDespesas.insertRow()
	linha.insertCell(0).innerHTML = `${ano}`
	linha.insertCell(1).innerHTML = `${mes}`
	linha.insertCell(2).innerHTML = `${categoria}`
			
	let celulaValor = linha.insertCell(3);
	celulaValor.className = "text-right";
	celulaValor.innerHTML = valorTotal;
}

function exibirModalFeedback(tipo, titulo, mensagem) {
	const modalDiv = document.getElementById('modalLblDiv')
    const modalTitulo = document.getElementById('exampleModalLabel')
    const modalCorpo = document.getElementById('modalMensagem')
    const modalBotao = document.getElementById('modalBtn')

	if (tipo === 'sucesso') {
        modalDiv.className = 'modal-header text-success';
        modalBotao.className = 'btn btn-success';
        modalBotao.innerHTML = 'Voltar';
    } else { 
        modalDiv.className = 'modal-header text-danger';
        modalBotao.className = 'btn btn-danger';
        modalBotao.innerHTML = 'Voltar e corrigir';
    }

	modalTitulo.innerHTML = titulo;
    modalCorpo.innerHTML = mensagem;
    $('#modalRegistraDespesa').modal('show');
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

function limparFiltros(tipo){
	document.getElementById('ano').value = ""
	document.getElementById('mes').value = ""
	document.getElementById('categoria').value = ""
	pesquisarDespesa(tipo)
}

function limparForm(){
		ano.value = ''
		mes.value = ''
		dia.value = ''
		categoria.value = ''
		descricao.value = ''
		valor.value = ''
}

function formataCampos(modo) {
	let dia = 'dia'
	let valor = 'valor'
	if(modo === 'edit'){
		dia = 'editDia'
		valor = 'editValor'
	}
	
    const campoDia = document.getElementById(dia)
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

    const campoValor = document.getElementById(valor)
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