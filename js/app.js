class Despesa {
	constructor(ano, mes, dia, tipo, descricao, valor) {
		this.ano = ano
		this.mes = mes
		this.dia = dia
		this.tipo = tipo
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
}

class Bd {
	constructor() {
		let id = localStorage.getItem('id')

		if(id === null) {
			localStorage.setItem('id', 0)
		}
	}

	getProximoId() {
		let proximoId = localStorage.getItem('id')
		return parseInt(proximoId) + 1
	}

	gravar(d) {
		let id = this.getProximoId()
		localStorage.setItem(id, JSON.stringify(d))
		localStorage.setItem('id', id)
	}

	recuperarRegistros(){
		let despesas = Array()

		let id = localStorage.getItem('id')
		for(let i = 1; i <= id; i++){
			let despesa = JSON.parse(localStorage.getItem(i))
			if(despesa === null){
				continue
			}
			despesa.id = i
			despesas.push(despesa)
		}
		return despesas
	}

	pesquisar(despesa){
		let despesasFiltradas = Array()
		despesasFiltradas = this.recuperarRegistros()

		if(despesa.ano != ''){
			despesasFiltradas = despesasFiltradas.filter(f => f.ano == despesa.ano)
		}
		if(despesa.mes != ''){
			despesasFiltradas = despesasFiltradas.filter(f => f.mes == despesa.mes)
		}
		if(despesa.dia != ''){
			despesasFiltradas = despesasFiltradas.filter(f => f.dia == despesa.dia)
		}
		if(despesa.tipo != ''){
			despesasFiltradas = despesasFiltradas.filter(f => f.tipo == despesa.tipo)
		}
		if(despesa.descricao != ''){
			despesasFiltradas = despesasFiltradas.filter(f => f.descricao == despesa.descricao)
		}
		if(despesa.valor != ''){
			despesasFiltradas = despesasFiltradas.filter(f => f.valor == despesa.valor)
		}
		return despesasFiltradas
	}

	remover(id){
		localStorage.removeItem(id)
	}
}

let bd = new Bd()

function cadastrarDespesa() {
	let ano = document.getElementById('ano')
	let mes = document.getElementById('mes')
	let dia = document.getElementById('dia')
	let tipo = document.getElementById('tipo')
	let descricao = document.getElementById('descricao')
	let valor = document.getElementById('valor')

	let despesa = new Despesa(
		ano.value, 
		mes.value, 
		dia.value, 
		tipo.value, 
		descricao.value,
		valor.value
	)

	if(despesa.validarDados()){
		bd.gravar(despesa)

		$('#modalRegistraDespesa').modal('show')
		document.getElementById('modalLblDiv').className = 'modal-header text-success'
		document.getElementById('exampleModalLabel').innerHTML = "Registro inserido com sucesso!"
		document.getElementById('modalMensagem').innerHTML = "A despesa foi cadastrada com sucesso"
		document.getElementById('modalBtn').innerHTML = "Voltar"
		document.getElementById('modalBtn').className = 'btn btn-success'
		limparForm()
		
	} else{
		$('#modalRegistraDespesa').modal('show')
		document.getElementById('modalLblDiv').className = 'modal-header text-danger'
		document.getElementById('exampleModalLabel').innerHTML = "Erro na inclusão do registro!"
		document.getElementById('modalMensagem').innerHTML = "Erro na gravação. Verifique se todos os campos foram preenchidos corretamente."
		document.getElementById('modalBtn').innerHTML = "Voltar e corrigir"
		document.getElementById('modalBtn').className = 'btn btn-danger'
		limparForm()
	}
}

function limparForm(){
		ano.value = ''
		mes.value = ''
		dia.value = ''
		tipo.value = ''
		descricao.value = ''
		valor.value = ''
}

function pesquisarDespesa(modo){
	var despesas = recuperaDespesa(modo)
	carregaListaDespesas(despesas, true)
}

function resumirDespesa(){
	var despesas = recuperaDespesa()
	carregaResumoDespesas(despesas, true)
}

function recuperaDespesa(modo){
	let ano = document.getElementById('ano').value
	let mes = document.getElementById('mes').value
	let tipo = document.getElementById('tipo').value
	let dia = ''
	let descricao = ''
	let valor = ''

	if(modo === 'pesquisa'){
		dia = document.getElementById('dia').value
		descricao = document.getElementById('descricao').value
		valor = document.getElementById('valor').value
	}
	
	let despesa = new Despesa(ano, mes, dia, tipo, descricao, valor)
	let despesas = bd.pesquisar(despesa)
	return despesas
}

function carregaResumoDespesas(despesas = Array(), filtro = false){
	if(despesas.length == 0 && filtro == false){
		despesas = bd.recuperarRegistros()
	}

	let total = 0
	for(i = 0; i < despesas.length; i++){
		total += parseFloat(despesas[i].valor) 
	}
	total = total.toFixed(2)

	let listaDespesas = document.getElementById('listaDespesas')
	listaDespesas.innerHTML = ''

	let maxhgt = 1

	despesas.forEach(function(d){
		let linha = listaDespesas.insertRow()
		d.ano = ano.value || 'Todos'

		if(mes.value != ''){
			let nomeMeses = {
				'1': "Janeiro",
				'2': "Fevereiro",
				'3': "Março",
				'4': "Abril",
				'5': "Maio",
				'6': "Junho",
				'7': "Julho",
				'8': "Agosto",
				'9': "Setembro",
				'10': "Outubro",
				'11': "Novembro",
				'12': "Dezembro",
			}
			if (nomeMeses[d.mes]) {
				d.mes = nomeMeses[d.mes];
			} 
		} else{
			d.mes = 'Todos'
		}

		if (tipo.value != ''){
			switch(d.tipo){
				case '1': d.tipo = "Alimentação"
					break
				case '2': d.tipo = "Educação"
					break
				case '3': d.tipo = "Lazer"
					break
				case '4': d.tipo = "Saúde"
					break
				case '5': d.tipo = "Transporte"
					break
			}
		} else{
			d.tipo = 'Todos'
		}

		if(maxhgt === 1){
			linha.insertCell(0).innerHTML = d.ano
			linha.insertCell(1).innerHTML = d.mes
			linha.insertCell(2).innerHTML = d.tipo
			linha.insertCell(3).outerHTML = `<td class="text-right">${total}</td>`;
			maxhgt++
		}
	})
}

function carregaListaDespesas(despesas = Array(), filtro = false){
	if(despesas.length == 0 && filtro == false){
		despesas = bd.recuperarRegistros()
	}

	let listaDespesas = document.getElementById('listaDespesas')
	listaDespesas.innerHTML = ''

	despesas.forEach(function(d){
		let linha = listaDespesas.insertRow()
		linha.insertCell(0).innerHTML = `${d.dia}/${d.mes}/${d.ano}`
		switch(d.tipo){
			case '1': d.tipo = "Alimentação"
				break
			case '2': d.tipo = "Educação"
				break
			case '3': d.tipo = "Lazer"
				break
			case '4': d.tipo = "Saúde"
				break
			case '5': d.tipo = "Transporte"
				break
		}
		linha.insertCell(1).innerHTML = `${d.tipo}`
		linha.insertCell(2).innerHTML = `${d.descricao}`
		linha.insertCell(3).innerHTML = `${d.valor}`

		let btn = document.createElement("button")
		btn.className = "btn btn-danger"
		btn.innerHTML = "<i class='fas fa-times'></i>"
		btn.id = `id_despesa_${d.id}`

		btn.onclick = function(){
			let id = this.id.replace ('id_despesa_', '')
			$('#modalRemoveDespesa').modal('show')
			document.getElementById('btnE').className = "btn btn-danger"

			document.getElementById('btnE').onclick = function(){
				bd.remover(id)
				window.location.reload()
			}
		}
		linha.insertCell(4).append(btn)
	})
}
