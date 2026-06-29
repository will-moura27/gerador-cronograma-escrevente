let disciplinasBase = JSON.parse(localStorage.getItem('listaMateriasUsuario')) || [];

// Template Fixo da Vunesp
const templateEscrevente = [
    "Língua Portuguesa", "Informática", "Raciocínio Lógico", 
    "Direito Administrativo", "Direito Processual Penal", "Direito Processual Civil", 
    "Direito Constitucional", "Direito Penal", "Matemática", "Normas da Corregedoria"
];

function renderizarMaterias() {
    const container = document.getElementById('lista-materias');
    container.innerHTML = disciplinasBase.map((mat, index) => `
        <div class="tag">
            ${mat.nome}
            <button class="tag-btn-remover" onclick="removerMateria(${index})">×</button>
        </div>
    `).join('');
}

function adicionarMateria() {
    const input = document.getElementById('nova-materia');
    const nome = input.value.trim();
    if (nome) {
        disciplinasBase.push({ id: Date.now() + Math.random(), nome: nome });
        localStorage.setItem('listaMateriasUsuario', JSON.stringify(disciplinasBase));
        input.value = '';
        renderizarMaterias();
    }
}

function removerMateria(index) {
    disciplinasBase.splice(index, 1);
    localStorage.setItem('listaMateriasUsuario', JSON.stringify(disciplinasBase));
    renderizarMaterias();
}

function carregarTemplateEscrevente() {
    if(disciplinasBase.length > 0) {
        const confirma = confirm("Isso vai substituir sua lista atual pelas matérias de Escrevente. Continuar?");
        if(!confirma) return;
    }
    
    // Mapeia o array de strings para o formato de objetos que o sistema usa
    disciplinasBase = templateEscrevente.map(nome => ({ id: Date.now() + Math.random(), nome: nome }));
    localStorage.setItem('listaMateriasUsuario', JSON.stringify(disciplinasBase));
    renderizarMaterias();
}

function limparTodasMaterias() {
    if(disciplinasBase.length === 0) return;
    if(confirm("Tem certeza que deseja apagar todas as matérias da lista?")) {
        disciplinasBase = [];
        localStorage.setItem('listaMateriasUsuario', JSON.stringify(disciplinasBase));
        renderizarMaterias();
    }
}

function gerarCronograma() {
    const inputHoras = parseInt(document.getElementById('horas').value);
    const diasSelecionados = Array.from(document.querySelectorAll('input[name="dias"]:checked')).map(cb => cb.value);
    
    if (disciplinasBase.length === 0) return alert("Cadastre ou carregue pelo menos uma matéria!");
    if (!inputHoras || diasSelecionados.length === 0) return alert("Preencha as horas e selecione os dias!");

    const matPorDia = Math.ceil(disciplinasBase.length / diasSelecionados.length);
    const minutosPorMat = Math.floor((inputHoras * 60) / matPorDia);
    
    let agenda = {};
    let matIndex = 0;

    diasSelecionados.forEach(dia => {
        agenda[dia] = [];
        for (let i = 0; i < matPorDia && matIndex < disciplinasBase.length; i++) {
            agenda[dia].push({
                ...disciplinasBase[matIndex],
                tempo: minutosPorMat,
                concluido: false,
                anotacao: "" 
            });
            matIndex++;
        }
    });

    localStorage.setItem('cronogramaVunesp', JSON.stringify(agenda));
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
                            <label>
                                <input type="checkbox" ${i.concluido ? 'checked' : ''} onchange="toggle('${dia}', ${i.id})"> 
                                ${i.nome}
                            </label>
                            <span>${Math.floor(i.tempo/60)}h ${i.tempo%60}m</span>
                        </div>
                        <input type="text" class="anotacao-input" placeholder="Ex: Parei na aula 3..." value="${i.anotacao || ''}" onchange="salvarAnotacao('${dia}', ${i.id}, this.value)">
                    </div>`).join('')}
            </div>`;
    });
    
    const pct = total > 0 ? Math.round((concluidos/total)*100) : 0;
    document.getElementById('progress-fill').style.width = pct + '%';
    document.getElementById('progress-text').innerText = pct + '% concluído';
    document.getElementById('resultado').classList.remove('hidden');
}

function toggle(dia, id) {
    let agenda = JSON.parse(localStorage.getItem('cronogramaVunesp'));
    agenda[dia] = agenda[dia].map(i => i.id === id ? { ...i, concluido: !i.concluido } : i);
    localStorage.setItem('cronogramaVunesp', JSON.stringify(agenda));
    renderizarCronograma(agenda);
}

function salvarAnotacao(dia, id, texto) {
    let agenda = JSON.parse(localStorage.getItem('cronogramaVunesp'));
    agenda[dia] = agenda[dia].map(i => i.id === id ? { ...i, anotacao: texto } : i);
    localStorage.setItem('cronogramaVunesp', JSON.stringify(agenda));
}

function limparCronograma() { 
    localStorage.removeItem('cronogramaVunesp'); 
    location.reload(); 
}

function baixarPDF() { 
    const elemento = document.getElementById('resultado');
    const botoes = document.querySelector('.botoes-acao');
    
    botoes.style.display = 'none'; 
    window.scrollTo(0, 0); 

    const inputs = elemento.querySelectorAll('input[type="text"].anotacao-input');
    inputs.forEach(input => {
        input.setAttribute('value', input.value);
        input.style.border = 'none';
        input.style.borderBottom = '1px solid #cbd5e1';
        input.style.backgroundColor = '#ffffff';
        input.style.borderRadius = '0';
    });

    const opt = {
        margin:       10, 
        filename:     'cronograma-metaciclo.pdf',
        image:        { type: 'jpeg', quality: 1 },
        html2canvas:  { 
            scale: 2,           
            scrollY: 0,
            useCORS: true 
        },
        pagebreak:    { mode: 'avoid-all' }, 
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(elemento).save().then(() => {
        botoes.style.display = 'flex';
        
        inputs.forEach(input => {
            input.style.border = '1px dashed #cbd5e1';
            input.style.borderBottom = '1px dashed #cbd5e1';
            input.style.backgroundColor = 'transparent';
            input.style.borderRadius = '6px';
        });
    });
}

document.getElementById('nova-materia').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') adicionarMateria();
});

document.addEventListener('DOMContentLoaded', () => {
    renderizarMaterias();
    
    const salvo = localStorage.getItem('cronogramaVunesp');
    if (salvo) {
        try { 
            renderizarCronograma(JSON.parse(salvo)); 
        } catch (e) { 
            localStorage.removeItem('cronogramaVunesp'); 
        }
    }
});