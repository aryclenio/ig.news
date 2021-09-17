import { GetStaticProps } from 'next';
import Link from 'next/link';
import Head from 'next/head';

import { getPrismicClient } from '../../services/prismic';

import Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom'
import { PostListContainer } from './styles';

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  updatedAt: string;
}

interface PostsProps {
  posts: Post[]
}

export default function Posts({ posts }: PostsProps) {
  return (
    <>
      <Head>
        <title> Posts | .dev Blog </title>
      </Head>

      <PostListContainer>
        <div className="posts">
          {posts?.map(post => (
            <Link href={`/posts/${post.slug}`} key={post.slug}>
              <a href="#" key={post.slug}>
                <time> {post.updatedAt} </time>
                <strong> {post.title} </strong>
                <p> {post.excerpt} </p>
              </a>
            </Link>
          ))}
        </div>
      </PostListContainer>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient()

  const response = await prismic.query([
    Prismic.predicates.at('document.type', 'publication')
  ], {
    fetch: ['publication.title', 'publication.content'],
    pageSize: 100,
  }
  )

  const posts = response.results.map(post => {
    return {
      slug: post.uid,
      title: RichText.asText(post.data.title),
      excerpt: post.data.content.find(content => content.type === 'paragraph')?.text ?? '',
      updatedAt: new Date(post.first_publication_date).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    }
  })


  return {
    props: {
      posts
    }
  }
}