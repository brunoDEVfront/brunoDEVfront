// EDITE: número do WhatsApp com 55 + DDD, só dígitos. Ex.: 5511987654321
const WHATSAPP = "5500000000000";

// Todo link com data-whatsapp abre a conversa já com a mensagem pronta.
// Se o link tiver data-servico, a mensagem cita o serviço escolhido.
document.querySelectorAll("[data-whatsapp]").forEach((link) => {
  const servico = link.dataset.servico;
  const mensagem = servico
    ? `Olá, Artur! Vi seu site e quero agendar: ${servico}.`
    : "Olá, Artur! Vi seu site e quero agendar um horário.";
  link.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
});

// Topo transparente sobre a foto; ganha fundo depois que a página rola.
const topo = document.querySelector("[data-topo]");
const marcarTopo = () => topo.classList.toggle("is-rolado", window.scrollY > 24);
marcarTopo();
window.addEventListener("scroll", marcarTopo, { passive: true });

// Fotos: cada moldura com data-foto mostra a imagem assim que o arquivo
// existir na pasta img/. Enquanto não existir, fica o espaço reservado.
document.querySelectorAll("[data-foto]").forEach((moldura) => {
  const foto = new Image();
  foto.alt = moldura.dataset.alt || "";
  foto.decoding = "async";
  foto.addEventListener("load", () => moldura.replaceChildren(foto));
  foto.src = moldura.dataset.foto;
});

// Destaca o dia de hoje na lista de horários.
const hoje = String(new Date().getDay());
document.querySelectorAll(".horarios [data-dia]").forEach((linha) => {
  if (linha.dataset.dia.split(" ").includes(hoje)) linha.classList.add("is-hoje");
});

document.querySelector("[data-ano]").textContent = new Date().getFullYear();
