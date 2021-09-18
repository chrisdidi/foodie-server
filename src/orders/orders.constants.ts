import { UserRole } from 'src/users/entities/user.entity';
import { OrderStatusStatus } from './entities/order-status-history.entity';

export const regUserSequence = {
  placed: 1,
  delivered: 5,
};

export const restOwnerSequence = {
  placed: 2,
  processing: 3,
  in_route: 4,
};

export const statusMap = [
  {
    key: 'placed',
    status: OrderStatusStatus.Placed,
    role: UserRole.RegularUser,
  },
  {
    key: 'canceled',
    status: OrderStatusStatus.Canceled,
    role: UserRole.RegularUser,
  },
  {
    key: 'processing',
    status: OrderStatusStatus.Processing,
    role: UserRole.RestaurantOwner,
  },
  {
    key: 'in_route',
    status: OrderStatusStatus.In_Route,
    role: UserRole.RestaurantOwner,
  },
  {
    key: 'delivered',
    status: OrderStatusStatus.Delivered,
    role: UserRole.RestaurantOwner,
  },
  {
    key: 'received',
    status: OrderStatusStatus.Received,
    role: UserRole.RegularUser,
  },
];
