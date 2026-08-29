import { Link } from "react-router-dom";

export default function PageHeader({ title, crumbs = [], actions, description }) {
  return (
    <div className="page-header mb-4">
      {crumbs.length > 0 && (
        <nav aria-label="Đường dẫn" className="mb-2">
          <ol className="breadcrumb mb-0">
            {crumbs.map((crumb, index) => {
              const last = index === crumbs.length - 1;
              return (
                <li
                  key={`${crumb.label}-${index}`}
                  className={`breadcrumb-item${last ? " active" : ""}`}
                  aria-current={last ? "page" : undefined}
                >
                  {last || !crumb.to ? crumb.label : <Link to={crumb.to}>{crumb.label}</Link>}
                </li>
              );
            })}
          </ol>
        </nav>
      )}
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
        <div>
          <h1 className="page-title mb-1">{title}</h1>
          {description && <p className="text-secondary mb-0">{description}</p>}
        </div>
        {actions && <div className="d-flex gap-2">{actions}</div>}
      </div>
    </div>
  );
}
