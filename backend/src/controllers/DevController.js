const axios = require('axios');

const Dev = require('../models/Dev');
const parseStringAsArray = require('../utils/parseStringAsArray');
const { findConnections, sendMessage } = require('../websocket');

module.exports = {
  async index(request, response) {
    const devs = await Dev.find();

    return response.json(devs);
  },

  async store(request, response) {
    const { github_username, techs, latitude, longitude } = request.body;

    let dev = await Dev.findOne({ github_username });

    if (!dev) {
      const apiResponse = await axios.get(`https://api.github.com/users/${github_username}`);

      const { name = login, avatar_url, bio } = apiResponse.data;
  
      const techsArray = parseStringAsArray(techs);
  
      const location = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };
  
      dev = await Dev.create({
        github_username,
        name,
        avatar_url,
        bio,
        techs: techsArray,
        location,
      });

      /* Verificar se o novo dev cadastrado está dentro dos 10 Km 
       * e se possui alguma das tecnologias pesquisadas por alguma das conexões
       */
      
      const sendSocketMessageTo = findConnections({ latitude, longitude }, techsArray);

      sendMessage(sendSocketMessageTo, 'new-dev', dev);
    }

    return response.json(dev);
  },

  async update(request, response) {
    const { id } = request.params;
    const { github_username, techs, longitude, latitude, ...data } = request.body;
    let values = data;

    if (longitude && latitude) {
      values = {
        ...values,
        location: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
      };
    }

    if (techs) {
      values = {
        ...values,
        techs: parseStringAsArray(techs),
      }
    }

    const dev = await Dev.findOneAndUpdate(
      { 
        _id: id,
      },
      {
        ...values,
      }
    );

    return response.json(dev);
  },

  async destroy(request, response) {
    const { id } = request.params;

    const devDeleted = await Dev.findOneAndDelete({ "_id": id });

    if (!devDeleted) {
      return response.json({ success: false, message: "Não foi possível remover o Dev" });
    }

    return response.json(devDeleted);
  }
};
