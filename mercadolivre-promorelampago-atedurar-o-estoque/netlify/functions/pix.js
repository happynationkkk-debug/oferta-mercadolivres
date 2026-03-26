exports.handler = async function(event, context) {
    // Permite apenas requisições POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Método não permitido' };
    }

    try {
        // O Netlify faz a chamada à MisticPay de forma oculta
        const requisicao = await fetch('https://api.misticpay.com/api/transactions/create', {
            method: 'POST',
            headers: {
                'ci': 'ci_6zeltjzmqao9ak9',
                'cs': 'cs_7gw6ztvmm6mvjgv0yxswvm51y',
                'Content-Type': 'application/json'
            },
            body: event.body // Repassa os dados do cliente (Nome, CPF, Valor)
        });

        const resposta = await requisicao.json();

        // Devolve a resposta (QR Code) para o nosso frontend
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resposta)
        };

    } catch (erro) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Erro de comunicação no servidor seguro." })
        };
    }
};