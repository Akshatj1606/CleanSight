import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/*
 * StatCard - standardized metric display card.
 * Props:
 *  icon: React element (already sized ~24-32px)
 *  label: string
 *  value: string|number|ReactNode
 *  meta?: string (small supporting text)
 *  accent?: 'green'|'blue'|'emerald'|'yellow'|'teal'
 *  trend?: { value: string, direction?: 'up'|'down', sr?: string }
 */
const colorMap = {
  green: 'text-green-600 bg-green-50 border-green-100',
  blue: 'text-blue-600 bg-blue-50 border-blue-100',
  emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  yellow: 'text-yellow-600 bg-yellow-50 border-yellow-100',
  teal: 'text-teal-600 bg-teal-50 border-teal-100'
};

const StatCard = ({ icon, label, value, meta, accent='green', trend }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
      className="card-surface hover-lift p-5"
      aria-label={label}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-lg border flex items-center justify-center ${colorMap[accent] || colorMap.green}`}>
          {icon}
        </div>
        {trend && (
          <div className={`text-xs font-medium flex items-center gap-1 ${trend.direction === 'down' ? 'text-red-600' : 'text-green-600'}`}> 
            {trend.direction !== 'down' ? '▲' : '▼'} {trend.value}
            {trend.sr && <span className="sr-only">{trend.sr}</span>}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-semibold tracking-tight text-gray-900">{value}</div>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        {meta && <p className="text-xs text-gray-400">{meta}</p>}
      </div>
    </motion.div>
  );
};

StatCard.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.node]).isRequired,
  meta: PropTypes.string,
  accent: PropTypes.oneOf(['green','blue','emerald','yellow','teal']),
  trend: PropTypes.shape({
    value: PropTypes.string.isRequired,
    direction: PropTypes.oneOf(['up','down']),
    sr: PropTypes.string
  })
};

export default StatCard;
