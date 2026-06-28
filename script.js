const disciplinas = [
    { id: 1, nome: "Língua Portuguesa", questoes: 24 },
    { id: 2, nome: "Informática", questoes: 14 },
    { id: 3, nome: "Raciocínio Lógico", questoes: 10 },
    { id: 4, nome: "Direito Administrativo", questoes: 8 },
    { id: 5, nome: "Direito Processual Penal", questoes: 7 },
    { id: 6, nome: "Direito Processual Civil", questoes: 7 },
    { id: 7, nome: "Direito Constitucional", questoes: 7 },
    { id: 8, nome: "Direito Penal", questoes: 6 },
    { id: 9, nome: "Matemática", questoes: 6 },
    { id: 10, nome: "Normas da Corregedoria", questoes: 5 }
];

const totalQuestoes = 94;

function gerarCronograma() {
    const inputHoras = document.getElementById('horas').value;
    const checkboxes = document.querySelectorAll('input[name="dias"]:checked');
    if (!inputHoras || checkboxes.length === 0) return alert("Preencha horas e dias!");

    const minutosSemanais = (inputHoras * checkboxes.length) * 60;
    const cronogramaDados = disciplinas.map(d => ({
        id: d.id, nome: d.nome, tempo: Math.round((d.questoes / totalQuestoes) * minutosSemanais), concluido: false
    }));

    localStorage.setItem('cronogramaDados', JSON.stringify(cronogramaDados));
    renderizarCronograma(cronogramaDados);
}

function renderizarCronograma(dados) {
    const container = document.getElementById('tabela-cronograma');
    container.innerHTML = dados.map(item => `
        <div class="materia-item ${item.concluido ? 'checked' : ''}">
            <label><input type="checkbox" ${item.concluido ? 'checked' : ''} onchange="toggleConcluido(${item.id})"> 
            <span class="materia-nome">${item.nome}</span></label>
            <span class="materia-tempo">${Math.floor(item.tempo/60)}h ${item.tempo%60}m</span>
        </div>
    `).join('');
    
    const concluidos = dados.filter(d => d.concluido).length;
    const porcentagem = Math.round((concluidos / dados.length) * 100);
    document.getElementById('progress-fill').style.width = `${porcentagem}%`;
    document.getElementById('progress-text').innerText = `${porcentagem}% concluído`;
    document.getElementById('resultado').classList.remove('hidden');
}

function toggleConcluido(id) {
    let dados = JSON.parse(localStorage.getItem('cronogramaDados'));
    dados = dados.map(d => d.id === id ? { ...d, concluido: !d.concluido } : d);
    localStorage.setItem('cronogramaDados', JSON.stringify(dados));
    renderizarCronograma(dados);
}

function limparCronograma() {
    localStorage.removeItem('cronogramaDados');
    document.getElementById('resultado').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    const salvo = localStorage.getItem('cronogramaDados');
    if (salvo) renderizarCronograma(JSON.parse(salvo));
});

function baixarPDF() {
    const elemento = document.getElementById('resultado');
    const botoes = document.querySelector('.botoes-acao');
    botoes.style.display = 'none';
    html2pdf().from(elemento).save('cronograma.pdf').then(() => botoes.style.display = 'flex');
}