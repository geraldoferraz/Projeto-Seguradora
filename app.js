const abrirHomeLink = document.querySelector('.homeLink');
const abrirHomeLink2 = document.querySelector('.homeLink2');
const abrirHomeLink3 = document.querySelector('.homeLink3');
const search = document.querySelector('.form-control');
const ul = document.querySelector('.clientes-container');

abrirHomeLink.addEventListener('click', trocarPag);
abrirHomeLink2.addEventListener('click', trocarPag2);
abrirHomeLink3.addEventListener('click', trocarPag3);

function trocarPag(event) {
    event.preventDefault();
    window.location.href = "http://127.0.0.1:5500/formularioCliente.html";
}

function trocarPag2(event) {
    event.preventDefault();
    window.location.href = "http://127.0.0.1:5500/BaseClientes.html";
}

function trocarPag3(event) {
    event.preventDefault();
    window.location.href = "http://127.0.0.1:5500/formularioApolice.html";
}

search.addEventListener('input', event => {
    const inputValue = event.target.value.trim().toLowerCase();

    Array.from(ul.children)
        .filter(cliente => !cliente.textContent.toLowerCase().includes(inputValue))
        .forEach(cliente => {
            cliente.classList.remove('d-flex');
            cliente.classList.add('hidden');
        });

    Array.from(ul.children)
        .filter(cliente => cliente.textContent.toLowerCase().includes(inputValue))
        .forEach(cliente => {
            cliente.classList.remove('hidden');
            cliente.classList.add('d-flex');
        });
});

function fetchClientes() { //mexeu nessa (aqui mostra os clientes que temos no banco de dados)
    fetch('http://localhost:8080/clientes')
        .then(response => response.json())
        .then(data => {
            data.forEach(cliente => {
                const li = document.createElement('li');
                li.className = "list-clientes clickable";
                const span = document.createElement('span');
                span.textContent = cliente.nome;
                li.appendChild(span);
                ul.appendChild(li);
                console.log(cliente.ID);

                li.addEventListener('click', () => { //adicionou isso 
                    window.location.href = `PerfilCliente.html?id=${cliente.ID}`;
                });
            });
        })
        .catch(error => console.error('Erro ao buscar clientes:', error));
}

document.addEventListener('DOMContentLoaded', () => {
    fetchClientes();
});

function fetchClienteData(clienteId) { //mexeu nessa 
    fetch(`http://localhost:8080/cliente/${clienteId}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            preencherFormularioComDados(data);
        })
        .catch(error => console.error('Erro ao buscar dados do cliente:', error));
}

function fetchPlanoSeguro(clienteId) {
    fetch(`http://localhost:8080/seguro/cliente/${clienteId}`)
        .then(response => response.json())
        .then(data => {
            preencherFormularioSeguroComDados(data);
        })
        .catch(error => console.error('Erro ao buscar dados do plano de seguro:', error));
}

function preencherFormularioComDados(cliente) { //mexeu nessa 
    document.querySelector('.nome').value = cliente.nome;
    document.querySelector('.genero').value = cliente.genero;
    document.querySelector('.email').value = cliente.email;
    document.querySelector('.telefone').value = cliente.telefone
    document.querySelector('.cep').value = cliente.cep;
    document.querySelector('.rua').value = cliente.rua;
    document.querySelector('.bairro').value = cliente.bairro;
    document.querySelector('.numero').value = cliente.numero;
}

function preencherFormularioSeguroComDados(plano) {
    document.querySelector('.tipo_viagem').value = plano.tipo_viagem;
    document.querySelector('.tipo_cobertura').value = plano.tipo_cobertura;
    document.querySelector('.status_cliente').value = plano.status_cliente;
    document.querySelector('.status_pagamento').value = plano.status_pagamento;
    document.querySelector('.data_pagamento').value = plano.data_pagamento;
    document.querySelector('.transporte').value = plano.transporte;
    document.querySelector('.data_saida').value = plano.data_saida;
    document.querySelector('.data_volta').value = plano.data_volta;
    document.querySelector('.destino').value = plano.destino; 
    document.querySelector('.CNPJ').value = plano.fk_seguradora_cnpj; 
}

function validarDocumento() { 
        const nome = document.querySelector('.nome').value.trim();
        const tipoCliente = document.querySelector('.Tipo_Cliente').value;
        const tipoDocumento = document.querySelector('.tipo_documento').value;
        const numeroDocumento = document.querySelector('.Numero_Documento').value.trim();
        const errorMessageElement = document.querySelector('.error-message');
    
        if (!nome) {
            errorMessageElement.textContent = 'Por favor, insira um nome válido';
            errorMessageElement.style.display = 'block';
            setTimeout(() => { errorMessageElement.style.display = 'none'; }, 3000);
            return false;
        }
        if (tipoCliente === 'Pessoa Física' && tipoDocumento !== 'CPF') {
            errorMessageElement.textContent = 'Pessoa física deve selecionar CPF como tipo de documento';
            errorMessageElement.style.display = 'block';
            setTimeout(() => { errorMessageElement.style.display = 'none'; }, 3000);
            return false;
        } else if (tipoCliente === 'Pessoa Jurídica' && tipoDocumento !== 'CNPJ') {
            errorMessageElement.textContent = 'Pessoa jurídica deve selecionar CNPJ como tipo de documento';
            errorMessageElement.style.display = 'block';
            setTimeout(() => { errorMessageElement.style.display = 'none'; }, 3000);
            return false;
        }
    
        if (tipoDocumento === 'CPF' && numeroDocumento.length !== 11) {
            errorMessageElement.textContent = 'Por favor, insira um CPF válido';
            errorMessageElement.style.display = 'block';
            setTimeout(() => { errorMessageElement.style.display = 'none'; }, 3000);
            return false;
        } else if (tipoDocumento === 'CNPJ' && numeroDocumento.length !== 14) {
            errorMessageElement.textContent = 'Por favor, insira um CNPJ válido';
            errorMessageElement.style.display = 'block';
            setTimeout(() => { errorMessageElement.style.display = 'none'; }, 3000);
            return false;
        }
    
        return true;
}

function handleFormSubmit(event) { //inserindo novo cliente no bd 
    event.preventDefault();

    if (validarDocumento()) {
        const form = document.querySelector('.form');
        const dados = new FormData(form);
        const dataObject = {};
        dados.forEach((value, key) => dataObject[key] = value);
        const jsonData = JSON.stringify(dataObject);

        fetch('http://127.0.0.1:8080/novoCliente', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: jsonData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Resposta de rede não foi ok');
            }
            return response.json();
        })
        .then(data => {
            localStorage.setItem('clienteId', data.cliente_id);
            trocarPag3(event);
        })
        .catch(error => {
            console.error('Erro ao enviar formulário:', error);
        });
    } else {
        console.log("Validação falhou. Formulário não enviado.");
    }
}

function handleFormSubmitSeguro(event) { //inserindo novo plano de seguro ao bd 
    event.preventDefault();

    const form = document.querySelector('.form2');
    const dados = new FormData(form);
    const dataObject = {};
    dados.forEach((value, key) => dataObject[key] = value);

    const clienteId = localStorage.getItem('clienteId');
    if (clienteId) {
        dataObject['fk_cliente_id'] = clienteId;
    }

    const jsonData = JSON.stringify(dataObject);

    fetch('http://127.0.0.1:8080/novoSeguro', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: jsonData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Resposta de rede não foi ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Resposta do servidor:', data);
        trocarPag2(event);
    })
    .catch(error => {
        console.error('Erro ao enviar formulário:', error);
    });
}