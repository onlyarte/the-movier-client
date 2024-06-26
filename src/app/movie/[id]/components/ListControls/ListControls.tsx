'use client';

import { IconButton } from '@/app/components';
import {
  ListDocument,
  PullMovieDocument,
  PushMovieDocument,
  UserDocument,
} from '@/graphql/graphql';
import { useMutation, useQuery } from '@apollo/client';
import {
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
} from '@material-tailwind/react';
import { Check, Plus } from 'react-feather';
import { useRevalidatePath } from '@/utils/next-revalidate';
import { useAuth } from '@/app/auth';

type Props = {
  movieId: number;
};

export default function ListControls({ movieId }: Props) {
  const { user, refetch } = useAuth();

  const lists = user?.lists ?? [];

  const [pushMovie] = useMutation(PushMovieDocument);
  const [pullMovie] = useMutation(PullMovieDocument);

  const [revalidatePath] = useRevalidatePath();

  const handleClick = async (listId: string, isAdded: boolean) => {
    await (isAdded ? pullMovie : pushMovie)({
      variables: { listId, movieId },
      refetchQueries: [{ query: ListDocument, variables: { id: listId } }],
    });
    await refetch?.();

    revalidatePath(`/list/${listId}`);
  };

  if (!lists.length) {
    return null;
  }

  return (
    <Menu placement="bottom-start">
      <MenuHandler>
        <IconButton Icon={Plus} type="button" background="highlight" />
      </MenuHandler>
      <MenuList className="p-1 backdrop-blur bg-background/75 text-current">
        {lists.map((list) => {
          const isAdded = list.movies.some(({ id }) => id === movieId);
          return (
            <MenuItem
              role="button"
              onClick={() => handleClick(list.id, isAdded)}
              key={list.id}
              className="flex items-center justify-between"
            >
              {list.title}
              {isAdded && <Check />}
            </MenuItem>
          );
        })}
      </MenuList>
    </Menu>
  );
}
