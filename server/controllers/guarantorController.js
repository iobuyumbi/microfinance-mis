const Guarantor = require('../models/Guarantor');

exports.createGuarantor = async (req, res, next) => {
  try {
    const guarantor = await Guarantor.create(req.body);
    res.status(201).json(guarantor);
  } catch (err) {
    next(err);
  }
};

exports.getGuarantors = async (req, res, next) => {
  try {
    const guarantors = await Guarantor.find();
    res.json(guarantors);
  } catch (err) {
    next(err);
  }
};

exports.getGuarantorById = async (req, res, next) => {
  try {
    const guarantor = await Guarantor.findById(req.params.id);
    if (!guarantor)
      return res.status(404).json({ error: 'Guarantor not found' });
    res.json(guarantor);
  } catch (err) {
    next(err);
  }
};

exports.updateGuarantor = async (req, res, next) => {
  try {
    const guarantor = await Guarantor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!guarantor)
      return res.status(404).json({ error: 'Guarantor not found' });
    res.json(guarantor);
  } catch (err) {
    next(err);
  }
};

exports.deleteGuarantor = async (req, res, next) => {
  try {
    const guarantor = await Guarantor.findByIdAndDelete(req.params.id);
    if (!guarantor)
      return res.status(404).json({ error: 'Guarantor not found' });
    res.json({ message: 'Guarantor deleted' });
  } catch (err) {
    next(err);
  }
};
