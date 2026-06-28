const disciplinas = [
    { id: 1, nome: "Língua Portuguesa" }, { id: 2, nome: "Informática" },
    { id: 3, nome: "Raciocínio Lógico" }, { id: 4, nome: "Direito Administrativo" },
    { id: 5, nome: "Direito Processual Penal" }, { id: 6, nome: "Direito Processual Civil" },
    { id: 7, nome: "Direito Constitucional" }, { id: 8, nome: "Direito Penal" },
    { id: 9, nome: "Matemática" }, { id: 10, nome: "Normas da Corregedoria" }
];

function gerarCronograma() {
    const inputHoras = parseInt(document.getElementById('horas').value);
    const diasSelecionados = Array.from(document.querySelectorAll('input[name="dias"]:checked')).map(cb => cb.value);
    
    if (!inputHoras || diasSelecionados.length === 0) return alert("Preencha horas e dias!");

    const matPorDia = Math.ceil(disciplinas.length / diasSelecionados.length);
    const minutosPorMat = Math.floor((inputHoras * 60) / matPorDia);
    
    let agenda = {};
    let matIndex = 0;

    diasSelecionados.forEach(dia => {
        agenda[dia] = [];
        for (let i = 0; i < matPorDia && matIndex < disciplinas.length; i++) {
            agenda[dia].push({
                ...disciplinas[matIndex],
                tempo: minutosPorMat,
                concluido: false,
                anotacao: "" // Adicionamos o campo vazio por padrão
            });
            matIndex++;
        }
    });

    localStorage.setItem('cronogramaDados', JSON.stringify(agenda));
    renderizarCronograma(agenda);
}

function renderizarCronograma(agenda) {
    const container = document.getElementById('tabela-cronograma');
    container.innerHTML = '';
    let total = 0, concluidos = 0;

    Object.keys(agenda).forEach(dia => {
        const itens = agenda[dia];
        total += itens.length;
        concluidos += itens.filter(i => i.concluido).length;
        
        container.innerHTML += `
            <div class="dia-wrapper">
                <h3>${dia}</h3>
                ${itens.map(i => `
                    <div class="materia-item ${i.concluido ? 'checked' : ''}">
                        <div class="materia-header">
                            <label><input type="checkbox" ${i.concluido ? 'checked' : ''} onchange="toggle('${dia}', ${i.id})"> ${i.nome}</label>
                            <span>${Math.floor(i.tempo/60)}h ${i.tempo%60}m</span>
                        </div>
                        <input type="text" class="anotacao-input" placeholder="Ex: Parei no Art. 5º, aula 3..." value="${i.anotacao || ''}" onchange="salvarAnotacao('${dia}', ${i.id}, this.value)">
                    </div>`).join('')}
            </div>`;
    });
    
    const pct = total > 0 ? Math.round((concluidos/total)*100) : 0;
    document.getElementById('progress-fill').style.width = pct + '%';
    document.getElementById('progress-text').innerText = pct + '% concluído';
    document.getElementById('resultado').classList.remove('hidden');
}

function toggle(dia, id) {
    let agenda = JSON.parse(localStorage.getItem('cronogramaDados'));
    agenda[dia] = agenda[dia].map(i => i.id === id ? { ...i, concluido: !i.concluido } : i);
    localStorage.setItem('cronogramaDados', JSON.stringify(agenda));
    renderizarCronograma(agenda);
}

// NOVA FUNÇÃO: Salva a anotação automaticamente
function salvarAnotacao(dia, id, texto) {
    let agenda = JSON.parse(localStorage.getItem('cronogramaDados'));
    agenda[dia] = agenda[dia].map(i => i.id === id ? { ...i, anotacao: texto } : i);
    localStorage.setItem('cronogramaDados', JSON.stringify(agenda));
}

function limparCronograma() { localStorage.removeItem('cronogramaDados'); location.reload(); }
function baixarPDF() { html2pdf().from(document.getElementById('resultado')).save('cronograma.pdf'); }

document.addEventListener('DOMContentLoaded', () => {
    const salvo = localStorage.getItem('cronogramaDados');
    if (salvo) renderizarCronograma(JSON.parse(salvo));
});