import Data from "../../models/data";
import connectToMongoDb from "../../lib/mongodb";

import type { NextApiRequest, NextApiResponse } from "next";
type ResponseData = {
  message: string;
  data: object;
};
export default async function CalculateData(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    const { username } = req.body.data;
    await connectToMongoDb();
    const data = await Data.find({});

    //get usernames
    let usernames: string | any[] = [];
    for (let elm of data) {
      if (!usernames.includes(elm.username)) {
        usernames.push(elm.username);
      }
    }

    //get equipes
    let equipes: string | any[] = [];
    for (let elm of data) {
      if (!equipes.includes(JSON.stringify(elm.equipe.sort()))) {
        equipes.push(JSON.stringify(elm.equipe.sort()));
      }
    }

    //get total of every username in every equipe
    let totOfUserInEveryEquipe = [];

    for (let username of usernames) {
      for (let equipe of equipes) {
        let somme = 0;

        data
          .filter((val) => {
            return (
              val.username === username &&
              JSON.stringify(val.equipe.sort()) === equipe
            );
          })
          .map((val) => {
            somme += val.montant;
          });

        totOfUserInEveryEquipe.push({ username, equipe: equipe, somme });
      }
    }

    totOfUserInEveryEquipe = totOfUserInEveryEquipe.filter((elm) =>
      JSON.parse(elm.equipe).includes(elm.username)
    );

    //total of every equipe
    let totOfEveryEquipe: string | any[] = [];
    for (let i of equipes) {
      let somme = 0;
      for (let j of totOfUserInEveryEquipe) {
        if (i === j.equipe) {
          somme += j.somme;
        }
      }
      totOfEveryEquipe.push({ equipe: i, total: somme });
    }
    
    
    let finalResult: string | any[] = [];
    for (let e of equipes) {
      for (let i of usernames) {
        let somme=0
        for (let j of totOfUserInEveryEquipe) {
          if (i === j.username && e===j.equipe) {
                somme+=j.somme
          }
        }
        let tot = totOfEveryEquipe.filter(a=>a.equipe===e)
        finalResult.push({username:i,equipe:e,somme,total:tot[0].total})

      }
    }

    finalResult = finalResult.filter(elm=>JSON.parse(elm.equipe).includes(elm.username)&&elm.username===username)
    return res.status(200).json({ message: "created succesfully", data:finalResult });
  } catch (err) {
    console.error(err);
  }
}
