import { Button, Box } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useInfiniteQuery } from 'react-query';

import { Header } from '../components/Header';
import { CardList } from '../components/CardList';
import { api } from '../services/api';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';

type FetchImagesResponse = {
  data: Array<{
    description: string;
    id: string;
    title: string;
    ts: number;
    url: string;
  }>;
  after: string | null;
};

export default function Home(): JSX.Element {
  async function fetchImages({
    pageParam = null,
  }): Promise<FetchImagesResponse> {
    const { data } = await api('/api/images', {
      params: {
        after: pageParam,
      },
    });
    return data;
  }

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery('images', fetchImages, {
    getNextPageParam: lastPage => lastPage.after,
  });

  const formattedData = useMemo(() => {
    if (!data?.pages.length) return [];

    const images: FetchImagesResponse['data'] = [];

    data.pages.forEach(page => {
      images.push(...page.data);
    });

    return images;
  }, [data]);

  if (isLoading) return <Loading />;

  if (isError) return <Error />;

  return (
    <>
      <Header />

      <Box maxW={1120} px={20} mx="auto" my={20}>
        <CardList cards={formattedData} />
        {hasNextPage && (
          <Button mt={10} onClick={() => fetchNextPage()}>
            {isFetchingNextPage ? 'Carregando...' : 'Carregar mais'}
          </Button>
        )}
      </Box>
    </>
  );
}
