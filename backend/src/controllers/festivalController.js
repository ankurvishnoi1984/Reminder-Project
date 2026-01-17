const { FestivalMaster } = require('../models');

const getAllFestivals = async (req, res) => {
  try {
    const festivals = await FestivalMaster.findAll({
      order: [['festivalDate', 'ASC']]
    });
    res.json(festivals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createFestival = async (req, res) => {
  try {
    const festival = await FestivalMaster.create(req.body);
    res.status(201).json(festival);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateFestival = async (req, res) => {
  try {
    const festival = await FestivalMaster.findByPk(req.params.id);
    if (!festival) {
      return res.status(404).json({ message: 'Festival not found' });
    }

    await festival.update(req.body);
    res.json(festival);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteFestival = async (req, res) => {
  try {
    const festival = await FestivalMaster.findByPk(req.params.id);
    if (!festival) {
      return res.status(404).json({ message: 'Festival not found' });
    }

    await festival.destroy();
    res.json({ message: 'Festival deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllFestivals,
  createFestival,
  updateFestival,
  deleteFestival
};
