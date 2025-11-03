'use client';
import { useTranslation } from '@/app/i18n/client';
import Breadcrumb from '@/components/ui/breadcrumb';
import Container from '@/components/ui/container';
import { useNotificationQuery } from '@/framework/basic-rest/notifications/useNotifications';
import { useState } from 'react';

const NotificationsPageContent = ({ lang }: any) => {
  const { t } = useTranslation(lang, 'Notifications');
  const [updateList, setUpdateList] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const { data, isLoading, error } = useNotificationQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  } else if (error) {
    return (
      <div className="text-2xl bg-blue-300/55 text-center">{error.message}</div>
    );
  }

  //   useEffect(() => {
  //     if (!isLoading && data) {
  //       setNotifications(data);
  //     }
  //   }, []);

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    });
  };

  return (
    <Container>
      <section className="my-10">
        {/* Breadcrupms */}
        <Breadcrumb lang={lang} />
        <div
          id="top"
          className="flex md:items-center md:justify-between md:flex-row flex-col gap-3 items-center"
        >
          <div className="leftSide">
            <h1 className="md:text-3xl text-xl font-bold">
              {t('Notifications')}
            </h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 bg-white shadow-lg rounded-lg">
          <div className="flex justify-between items-center border-b pb-3 mb-3">
            <h2 className="text-xl font-semibold">Notifications</h2>
            <button
              //   onClick={markAllAsRead}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Mark All as Read
            </button>
          </div>
          {data?.length === 0 ? (
            <p className="text-gray-500">No new notifications</p>
          ) : (
            <ul>
              {data?.map((notification: any) => (
                <li
                  key={notification._id}
                  className="p-3 border-b last:border-none"
                >
                  {/* <span className="px-2 py-1 text-xs font-semibold text-white bg-blue-500 rounded">
                    {notification.category.toUpperCase()}
                  </span> */}
                  <p className="text-sm mt-1">{notification.content}</p>
                  <span className="text-xs text-gray-400">
                    {formatDate(notification.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </Container>
  );
};

export default NotificationsPageContent;
