// Base de dados com as matérias e quantidade de questões do edital
const disciplinas = [
    { nome: "Língua Portuguesa", questoes: 24 },
    { nome: "Informática", questoes: 14 },
    { nome: "Raciocínio Lógico", questoes: 10 },
    { nome: "Direito Administrativo", questoes: 8 },
    { nome: "Direito Processual Penal", questoes: 7 },
    { nome: "Direito Processual Civil", questoes: 7 },
    { nome: "Direito Constitucional", questoes: 7 },
    { nome: "Direito Penal", questoes: 6 },
    { nome: "Matemática", questoes: 6 },
    { nome: "Normas da Corregedoria", questoes: 5 }
];

const totalQuestoes = 94; 

// Evento que roda assim que o site carrega para buscar dados salvos
document.addEventListener('DOMContentLoaded', () => {
    const cronogramaSalvo = localStorage.getItem('cronogramaVunesp');
    
    if (cronogramaSalvo) {
        // Se existir algo salvo, injeta na tela e mostra a div
        document.getElementById('tabela-cronograma').innerHTML = cronogramaSalvo;
        document.getElementById('resultado').classList.remove('hidden');
    }
});

function gerarCronograma() {
    const inputHoras = document.getElementById('horas').value;
    const checkboxes = document.querySelectorAll('input[name="dias"]:checked');
    const diasSelecionados = checkboxes.length;

    if (!inputHoras || inputHoras <= 0) {
        alert("Por favor, insira um número válido de horas.");
        return;
    }

    if (diasSelecionados === 0) {
        alert("Selecione pelo menos um dia da semana para estudar.");
        return;
    }

    const horasSemanais = inputHoras * diasSelecionados;
    const minutosSemanais = horasSemanais * 60;
    
    let htmlResultado = '';

    disciplinas.forEach(disciplina => {
        const porcentagemMateria = disciplina.questoes / totalQuestoes;
        const minutosMateria = Math.round(porcentagemMateria * minutosSemanais);
        
        const horasFormatadas = Math.floor(minutosMateria / 60);
        const minutosFormatados = minutosMateria % 60;
        
        let tempoTexto = '';
        if (horasFormatadas > 0) tempoTexto += `${horasFormatadas}h `;
        if (minutosFormatados > 0) tempoTexto += `${minutosFormatados}m`;
        if (horasFormatadas === 0 && minutosFormatados === 0) tempoTexto = '15m'; 

        htmlResultado += `
            <div class="materia-item">
                <span class="materia-nome">${disciplina.nome}</span>
                <span class="materia-tempo">${tempoTexto} por semana</span>
            </div>
        `;
    });

    // Inserir na tela
    document.getElementById('tabela-cronograma').innerHTML = htmlResultado;
    document.getElementById('resultado').classList.remove('hidden');

    // Salvar o HTML gerado na memória do navegador
    localStorage.setItem('cronogramaVunesp', htmlResultado);
}

// Função para apagar o cronograma da memória e da tela
function limparCronograma() {
    localStorage.removeItem('cronogramaVunesp');
    document.getElementById('tabela-cronograma').innerHTML = '';
    document.getElementById('resultado').classList.add('hidden');
}

function baixarPDF() {
    const elemento = document.getElementById('resultado');
    const btnPdf = document.getElementById('btn-pdf');
    const btnLimpar = document.getElementById('btn-limpar');
    
    // Esconde os botões para não saírem no PDF
    btnPdf.style.display = 'none';
    btnLimpar.style.display = 'none';

    const opcoes = {
        margin:       [15, 15, 15, 15], 
        filename:     'meu-cronograma-vunesp.pdf',
        image:        { type: 'jpeg', quality: 1.0 },
        html2canvas:  { 
            scale: 2,
            useCORS: true,
            scrollY: 0,
            windowWidth: document.documentElement.offsetWidth,
            windowHeight: document.documentElement.offsetHeight
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opcoes).from(elemento).save().then(() => {
        // Restaura os botões
        btnPdf.style.display = 'block';
        btnLimpar.style.display = 'block';
    });
}