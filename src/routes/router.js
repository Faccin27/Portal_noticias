// Importando os módulos necessários
const { Router } = require("express");
const router = new Router();
const LoginController = require('../controllers/LoginController');
const RegisterController = require('../controllers/RegisterController');
const UsuarioDAO = require('../models/dao/UsuarioDAO');
const NoticiaDAO = require('../models/dao/NoticiaDAO');
const ParceiroDAO = require("../models/dao/ParceiroDAO");
const EmpregoDAO = require('../models/dao/EmpregoDAO');
const EventoDAO = require('../models/dao/EventoDAO');

let usuarioLogado;

async function getUsuarioLogado(req) {
  usuarioLogado = await UsuarioDAO.getById(req.id);
}

router.get('/', async (req, res) => {
  await getUsuarioLogado(req)

  let listaEventos = await EventoDAO.getLatest(3);
  let listaEmpregos = await EmpregoDAO.getLatest(3);
  let listaNoticias = await NoticiaDAO.getLatest(6);
  let listaParceiros = await ParceiroDAO.getLatest(3);
  if (usuarioLogado) {
    res.status(200).render("dashboard", {
      usuarioLogado: usuarioLogado.get(),
      listaNoticias: listaNoticias,
      listaParceiros: listaParceiros,
      listaEmpregos: listaEmpregos,
      listaEventos: listaEventos
    })
  } else {
    res.status(200).render("dashboard", {
      listaNoticias: listaNoticias,
      listaParceiros: listaParceiros,
      listaEmpregos: listaEmpregos,
      listaEventos: listaEventos

    })
  }
});

router.get('/login', async (req, res) => {
  await getUsuarioLogado(req)
  if (!usuarioLogado) {
    res.status(200).render("login")
  } else {
    return res.redirect('/');
  }
});

router.get('/eventos', async (req, res) => {
  await getUsuarioLogado(req);
  let listaEventos = await EventoDAO.getAll();

  if (usuarioLogado) {
    res.status(200).render("all-events", {
      usuarioLogado: usuarioLogado.get(),
      listaEventos: listaEventos
    })
  } else {
    res.status(200).render("all-events", {
      listaEventos: listaEventos
    })
  }
})

router.get('/evento/:id', async (req, res) => {
  await getUsuarioLogado(req);
  const eventoId = req.params.id;

  try {
    const evento = await EventoDAO.getById(eventoId);

    if (!evento) {
      return res.status(404).render("error", { message: "evento não encontrado" });
    }

    if (usuarioLogado) {
      res.status(200).render("events", {
        usuarioLogado: usuarioLogado.get(),
        evento: evento
      });
    } else {
      res.status(200).render("events", {
        evento: evento
      });
    }
  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    res.status(500).render("error", { message: "Erro ao carregar o evento" });
  }
});

router.get('/empregos', async (req, res) => {
  await getUsuarioLogado(req);
  let listaEmpregos = await EmpregoDAO.getAll();

  if (usuarioLogado) {
    res.status(200).render("all-jobs", {
      usuarioLogado: usuarioLogado.get(),
      listaEmpregos: listaEmpregos
    })
  } else {
    res.status(200).render("all-jobs", {
      listaEmpregos: listaEmpregos
    })
  }
})

router.get('/emprego/:id', async (req, res) => {
  await getUsuarioLogado(req);
  const empregoId = req.params.id;

  try {
    const emprego = await EmpregoDAO.getById(empregoId);

    if (!emprego) {
      return res.status(404).render("error", { message: "Emprego não encontrada" });
    }

    if (usuarioLogado) {
      res.status(200).render("jobs", {
        usuarioLogado: usuarioLogado.get(),
        emprego: emprego
      });
    } else {
      res.status(200).render("jobs", {
        emprego: emprego
      });
    }
  } catch (error) {
    console.error('Erro ao buscar emprego:', error);
    res.status(500).render("error", { message: "Erro ao carregar a emprego" });
  }
});

router.get('/parceiros', async (req, res) => {
  await getUsuarioLogado(req);
  let listaParceiros = await ParceiroDAO.getAll();

  if (usuarioLogado) {
    res.status(200).render("all-partners", {
      usuarioLogado: usuarioLogado.get(),
      listaParceiros: listaParceiros
    })
  } else {
    res.status(200).render("all-partners", {
      listaParceiros: listaParceiros
    })
  }
});

router.get('/noticias', async (req, res) => {
  await getUsuarioLogado(req);
  let listaNoticias = await NoticiaDAO.getAll();

  if (usuarioLogado) {
    res.status(200).render("all-news", {
      usuarioLogado: usuarioLogado.get(),
      listaNoticias: listaNoticias
    });
  } else {
    res.status(200).render("all-news", {
      listaNoticias: listaNoticias
    });
  }
});

router.get('/noticia/:id', async (req, res) => {
  await getUsuarioLogado(req);
  const noticiaId = req.params.id;

  try {
    const noticia = await NoticiaDAO.getById(noticiaId);

    if (!noticia) {
      return res.status(404).render("error", { message: "Notícia não encontrada" });
    }

    if (usuarioLogado) {
      res.status(200).render("news", {
        usuarioLogado: usuarioLogado.get(),
        noticia: noticia
      });
    } else {
      res.status(200).render("news", {
        noticia: noticia
      });
    }
  } catch (error) {
    console.error('Erro ao buscar notícia:', error);
    res.status(500).render("error", { message: "Erro ao carregar a notícia" });
  }
});

router.get('/register', async (req, res) => {
  await getUsuarioLogado(req);

  if (!usuarioLogado) {
    res.status(200).render("register")
  } else { res.redirect('/') }

});

router.post('/register', RegisterController.register);
router.post('/login', LoginController.login);

//postar noticia
router.post('/noticias/create', async (req, res) => {
  await getUsuarioLogado(req);

  if (usuarioLogado) {
    const { title, description, content, category } = req.body;
    try {
      const newNoticia = await NoticiaDAO.create({
        idUsuario: usuarioLogado.id, categoria: category, titulo: title, descricao: description, conteudo: content
      });
      res.status(201).redirect("/noticias");
    } catch (error) {
      console.error('Erro ao criar notícia:', error);
      res.status(500).json({ error: 'erro ao criar postagem' });
    }
  } else {
    res.redirect('/');
  }
});


// criar novo parceiro
router.post('/parceiros/create', async (req, res) => {
  await getUsuarioLogado(req);

  if (usuarioLogado) {
    const { ptitle, pdescription, pcontent } = req.body;
    try {
      const newParceiro = await ParceiroDAO.create({
        titulo: ptitle, descricao: pdescription, conteudo: pcontent
      });
      res.status(201).redirect("/parceiros");
    } catch (error) {
      res.status(500).json({ error: 'erro ao criar parceiro' })
    }
  } else {
    res.redirect('/')
  }
})


router.get('/deslogar', (req, res) => {
  res.clearCookie('tokenJWT');
  return res.redirect(301, '/');
});



module.exports = router;