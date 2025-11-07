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
		let categoriaTraduzida = ''
		switch(this.categoria){
            case '1': categoriaTraduzida = 'ALIMENTACAO'; break;
            case '2': categoriaTraduzida = 'EDUCACAO'; break;
            case '3': categoriaTraduzida = 'LAZER'; break;
            case '4': categoriaTraduzida = 'SAUDE'; break;
            case '5': categoriaTraduzida = 'TRANSPORTE'; break;
			default: categoriaTraduzida = 'OUTROS';
        }

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

function cadastrarDespesa() {
	let ano = document.getElementById('ano').value
	let mes = document.getElementById('mes').value
	let dia = document.getElementById('dia').value
	let categoria = document.getElementById('categoria').value
	let descricao = document.getElementById('descricao').value
	let valor = document.getElementById('valor').value

	let despesa = new Despesa(ano, mes, dia, categoria, descricao, valor)
	let despesaTraduzida = despesa.traduzirParaApi();

	if(despesa.validarDados()){
		fetch('http://localhost:8080/despesas', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(despesaTraduzida)
		})

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
		categoria.value = ''
		descricao.value = ''
		valor.value = ''
}

function pesquisarDespesa(modo){
	traduzirParaApi(modo)

}

function resumirDespesa(){
	var despesas = recuperaDespesa()
	carregaResumoDespesas(despesas, true)
}

function recuperaDespesa(modo){
	let ano = document.getElementById('ano').value
	let mes = document.getElementById('mes').value
	let categoria = document.getElementById('categoria').value
	let dia = ''
	let descricao = ''
	let valor = ''

	if(modo === 'pesquisa'){
		dia = document.getElementById('dia').value
		descricao = document.getElementById('descricao').value
		valor = document.getElementById('valor').value
	}
	
	let despesa = new Despesa(ano, mes, dia, categoria, descricao, valor)
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

		if (categoria.value != ''){
			switch(d.categoria){
				case 'ALIMENTACAO': d.categoria = "Alimentação"
					break
				case 'EDUCACAO': d.categoria = "Educação"
					break
				case 'LAZER': d.categoria = "Lazer"
					break
				case 'SAUDE': d.categoria = "Saúde"
					break
				case 'TRANSPORTE': d.categoria = "Transporte"
					break
				case 'OUTROS': d.categoria = "Outros"
					break
			}
		} else{
			d.categoria = 'Todos'
		}

		if(maxhgt === 1){
			linha.insertCell(0).innerHTML = d.ano
			linha.insertCell(1).innerHTML = d.mes
			linha.insertCell(2).innerHTML = d.categoria
			linha.insertCell(3).outerHTML = `<td class="text-right">${total}</td>`;
			maxhgt++
		}
	})
}

function carregaDespesas(){
	fetch('http://localhost:8080/despesas')
		.then(resposta => {
			if(!resposta.ok){
				throw new Error (`Erro de rede: ${resposta.statusText}`)
			}
			return resposta.json()
		})
		.then(listaDespesas => {
			exibeDespesas(listaDespesas)
		})
		.catch(erro => {
			console.error('Erro ao buscar despesas:', erro)
			alert('Não foi possível carregar as despesas')
		})
}

function exibeDespesas(despesas){
	let listaDespesas = document.getElementById('listaDespesas')
	listaDespesas.innerHTML = ''

	despesas.forEach(function(d) {
		let linha = listaDespesas.insertRow()
		const [ano, mes, dia] = d.data.split('-')
		linha.insertCell(0).innerHTML = `${dia}/${mes}/${ano}`
		linha.insertCell(1).innerHTML = d.categoria
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
