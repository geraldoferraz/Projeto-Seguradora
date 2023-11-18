function buscarCEP() {
    const cep = document.getElementById('CEP').value.trim();

    if (cep.length === 8) {
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => response.json())
            .then(data => {
                if (data.erro) {
                    console.log("CEP não encontrado.");
                    return;
                }
                document.getElementById('Rua').value = data.logradouro;
                document.getElementById('Bairro').value = data.bairro;
            })
            .catch(error => console.error('CEP não encontrado na API. Por favor, preencha os campos Rua e Bairro manualmente.', error));
    }
}

