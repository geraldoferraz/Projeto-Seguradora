const abrirHomeLink = document.querySelector('.homeLink');
const abrirHomeLink2 = document.querySelector('.homeLink2');
const abrirHomeLink3 = document.querySelector('.homeLink3');
const search = document.getElementById('search');
const ul = document.getElementById('clientesList');



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

function toggleFiltro(event) {
    event.preventDefault();
    var sidebar = document.getElementById("mySidebar");
    sidebar.classList.toggle("open");
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


function fetchClientes() {
    fetch('http://localhost:8080/clientes')
        .then(response => response.json())
        .then(clientes => {
            atualizarListaClientes(clientes);
        })
        .catch(error => console.error('Erro ao buscar clientes:', error));
}

function fetchClientesComFiltro() {
    const filtroGenero = document.querySelector('#filtroGenero').value;
    const filtroStatusCliente = document.querySelector('#filtroStatusCliente').value;
    const filtroStatusPagamento = document.querySelector('#filtroStatusPagamento').value;

    let query = [];
    if (filtroGenero) {
        query.push(`filtroGenero=${encodeURIComponent(filtroGenero)}`);
    }
    if (filtroStatusCliente) {
        query.push(`filtroStatusCliente=${encodeURIComponent(filtroStatusCliente)}`);
    }
    if (filtroStatusPagamento) {
        query.push(`filtroStatusPagamento=${encodeURIComponent(filtroStatusPagamento)}`);
    }
    query = query.join('&');

    fetch(`http://localhost:8080/clientes?${query}`)
        .then(response => response.json())
        .then(clientes => {
            atualizarListaClientes(clientes);
        })
        .catch(error => console.error('Erro ao buscar clientes:', error));
}


function atualizarListaClientes(clientes) {
    const listaClientes = document.querySelector('.clientes-container');
    listaClientes.innerHTML = '';

    clientes.forEach(cliente => {
        const li = document.createElement('li');
        li.className = "list-clientes clickable";
        const span = document.createElement('span');
        span.textContent = cliente.nome;
        li.appendChild(span);

        li.addEventListener('click', () => {
            window.location.href = `PerfilCliente.html?id=${cliente.ID}`;
        });

        listaClientes.appendChild(li);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchClientesComFiltro(); 
});

document.addEventListener('DOMContentLoaded', () => {
    fetchClientes();

    const urlParams = new URLSearchParams(window.location.search);
    const clienteId = urlParams.get('id');

    if (clienteId) {
        fetchClienteData(clienteId);
        addDeleteListener(clienteId);
    }
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
    document.querySelector('.fk_seguradora_cnpj').value = plano.fk_seguradora_cnpj; 
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

function deleteCliente() {
    const urlParams = new URLSearchParams(window.location.search);
    const clienteId = urlParams.get('id');

    if (clienteId && confirm('Tem certeza que deseja deletar este cliente?')) {
        fetch(`http://localhost:8080/cliente/${clienteId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                // throw new Error('Falha ao deletar cliente');
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(data => {
            alert('Cliente deletado com sucesso.');
            // Redirecionar para outra página
            window.location.href = "http://127.0.0.1:5500/BaseClientes.html";
        })
        .catch(error => {
            console.error('Erro ao deletar cliente:', error);
            alert('Erro ao deletar cliente.');
        });
    }
}

function deletePlanoSeguro() {
    const urlParams = new URLSearchParams(window.location.search);
    const planoSeguroId = urlParams.get('id');

    if (planoSeguroId && confirm('Tem certeza que deseja deletar este plano de seguro?')) {
        fetch(`http://localhost:8080/planoSeguro/${planoSeguroId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Falha ao deletar plano de seguro');
            }
            return response.json();
        })
        .then(data => {
            alert('Plano de seguro deletado com sucesso.');
            window.location.href = "http://127.0.0.1:5500/BaseClientes.html";
        })
        .catch(error => {
            console.error('Erro ao deletar plano de seguro:', error);
            alert('Erro ao deletar plano de seguro.');
        });
    }
}

function atualizarCliente() {
    const urlParams = new URLSearchParams(window.location.search);
    const clienteId = urlParams.get('id');

    if (!clienteId) {
        console.error('Cliente ID não encontrado.');
        return;
    }

    const data = {
        nome: document.querySelector('.nome').value,
        telefone: document.querySelector('.telefone').value, 
        email: document.querySelector('.email').value,
        genero: document.querySelector('.genero').value,
        cep: document.querySelector('.cep').value,
        rua: document.querySelector('.rua').value,
        bairro: document.querySelector('.bairro').value,
        numero: document.querySelector('.numero').value
    };

    fetch(`http://localhost:8080/cliente/${clienteId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Falha na atualização do cliente');
        }
        return response.json();
    })
    .then(data => {
        alert('Cliente atualizado com sucesso.');
        window.location.reload();
    })
    .catch(error => {
        console.error('Erro na atualização do cliente:', error);
        alert('Erro ao atualizar o cliente.');
    });
}

function atualizarPlanoSeguro() {
    const urlParams = new URLSearchParams(window.location.search);
    const clienteId = urlParams.get('id');

    if (!clienteId) {
        console.error('Plano de Seguro ID não encontrado.');
        return;
    }

    const data = {
        tipo_viagem: document.querySelector('.tipo_viagem').value,
        tipo_cobertura: document.querySelector('.tipo_cobertura').value,
        status_cliente: document.querySelector('.status_cliente').value,
        status_pagamento: document.querySelector('.status_pagamento').value,
        data_pagamento: document.querySelector('.data_pagamento').value,
        transporte: document.querySelector('.transporte').value,
        data_saida: document.querySelector('.data_saida').value,
        data_volta: document.querySelector('.data_volta').value,
        destino: document.querySelector('.destino').value, 
        fk_seguradora_cnpj: document.querySelector('.fk_seguradora_cnpj').value
    };
    console.log(data); 
    fetch(`http://localhost:8080/planoSeguro/${clienteId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Falha na atualização do plano de seguro');
        }
        return response.json();
    })
    .then(data => {
        alert('Plano de seguro atualizado com sucesso.');
        window.location.reload();
    })
    .catch(error => {
        console.error('Erro na atualização do plano de seguro:', error);
        alert('Erro ao atualizar o plano de seguro.');
    });
}
