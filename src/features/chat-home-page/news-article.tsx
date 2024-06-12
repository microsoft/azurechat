import { FC } from "react";
import { NewsArticleModel } from "@/features/common/services/news-service/news-model";

interface Props {
  newsArticle: NewsArticleModel
}

export const NewsArticle: FC<Props> = (props) => {
  const { newsArticle  } = props;
  return (
    <article className="border shadow-md rounded-lg p-5">
        <h3 className="font-semibold text-lg mb-2">{newsArticle.title}</h3>
        <p className="text-muted-foreground">
            {newsArticle.description}
        </p>
        <a href={newsArticle.link} className="text-primary mt-3 block">Read more</a>
    </article>
  );
};
