
document.querySelector('.tipo_cobertura').addEventListener('change', atualizaCNPJ);

function atualizaCNPJ() {
    const tipo_Cobertura = document.querySelector('.tipo_cobertura').value;
    const CNPJ = document.querySelector('.fk_seguradora_cnpj');
    const errorMessageElement = document.querySelector('.error-message');

    if (tipo_Cobertura === 'Total') {
        CNPJ.value = '34567890000123';
    } else if (tipo_Cobertura === 'Parcial') {
        CNPJ.value = '62101604000181';
    } else if (tipo_Cobertura === 'Escolha-aqui') {
        errorMessageElement.textContent = 'Por favor, escolha um tipo de cobertura válido';
        errorMessageElement.style.display = 'block';
        setTimeout(() => { errorMessageElement.style.display = 'none'; }, 3000);
        return false;
    }
}


function checagemViagem() {
    const tipoViagem = document.querySelector('.tipo_viagem').value; 

    if(tipoViagem === 'Escolha-aqui'){
        errorMessageElement.textContent = 'Por favor, escolha um tipo de viagem válido';
        errorMessageElement.style.display = 'block';
        setTimeout(() => { errorMessageElement.style.display = 'none'; }, 3000);
        return false;
    }
}
