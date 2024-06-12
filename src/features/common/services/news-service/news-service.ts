"use server";
import "server-only";

import { ConfigContainer } from "@/features/common/services/cosmos";

import { ServerActionResponse } from "@/features/common/server-action-response";
import { SqlQuerySpec } from "@azure/cosmos";
import { NEWS_ARTICLE, NewsArticleModel } from "@/features/common/services/news-service/news-model";

export const FindAllNewsArticles = async (
): Promise<ServerActionResponse<Array<NewsArticleModel>>> => {
  try {
    const querySpec: SqlQuerySpec = {
      query:
        "SELECT * FROM root r WHERE r.type=@type",
      parameters: [
        {
          name: "@type",
          value: NEWS_ARTICLE,
        }
      ],
    };

    const { resources } = await ConfigContainer()
      .items.query<NewsArticleModel>(querySpec)
      .fetchAll();

    if (resources) {
      return {
        status: "OK",
        response: resources,
      };
    } else {
      return {
        status: "ERROR",
        errors: [
          {
            message: "No news found",
          },
        ],
      };
    }
  } catch (e) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `${e}`,
        },
      ],
    };
  }
};
